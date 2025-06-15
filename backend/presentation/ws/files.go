package ws

import (
	"fmt"
	"log"
	"time"

	"github.com/YahiroRyo/yappi_storage/backend/helper"
)

type UploadFileChunkData struct {
	Checksum uint64
	Chunk    []byte
}

type UploadSession struct {
	FileName  string
	Chunks    [][]byte
	TotalSize int64
	IsActive  bool
	StartTime time.Time
}

var uploadSessions = make(map[string]*UploadSession)

func (wsc *WsController) initializeFileName(filename string) EventEnvelopeResponse {
	log.Printf("Initializing file upload for: %s", filename)

	// 一意のセッションIDを生成
	sessionID := fmt.Sprintf("%s_%d", filename, time.Now().UnixNano())
	uploadSessions[sessionID] = &UploadSession{
		FileName:  filename,
		Chunks:    make([][]byte, 0),
		TotalSize: 0,
		IsActive:  true,
		StartTime: time.Now(),
	}

	return EventEnvelopeResponse{
		Event: EventEnvelopeEventInitializeFileName,
		Data:  map[string]string{"session_id": sessionID, "status": "initialized"},
	}
}

func (wsc *WsController) uploadFileChunk(data UploadFileChunkData) EventEnvelopeResponse {
	log.Printf("Received file chunk with checksum: %d, size: %d bytes", data.Checksum, len(data.Chunk))

	// CheckSumの検証
	if !helper.CalculateChecksum(data.Chunk, data.Checksum) {
		log.Printf("Checksum verification failed for chunk")
		return EventEnvelopeResponse{
			Event: EventEnvelopeEventUploadFileChunk,
			Data:  map[string]string{"status": "error", "message": "checksum_mismatch"},
		}
	}

	log.Printf("Checksum verification successful for chunk")

	// 現在のセッションを見つける（簡単な実装：最後にアクティブなセッション）
	var currentSession *UploadSession
	var currentSessionID string
	for sessionID, session := range uploadSessions {
		if session.IsActive {
			currentSession = session
			currentSessionID = sessionID
			break
		}
	}

	if currentSession == nil {
		log.Printf("No active session found for chunk upload")
		return EventEnvelopeResponse{
			Event: EventEnvelopeEventUploadFileChunk,
			Data:  map[string]string{"status": "error", "message": "no_active_session"},
		}
	}

	// チャンクをセッションに追加
	currentSession.Chunks = append(currentSession.Chunks, data.Chunk)
	currentSession.TotalSize += int64(len(data.Chunk))

	log.Printf("Chunk added to session %s. Total chunks: %d, Total size: %d bytes",
		currentSessionID, len(currentSession.Chunks), currentSession.TotalSize)

	return EventEnvelopeResponse{
		Event: EventEnvelopeEventUploadFileChunk,
		Data: map[string]interface{}{
			"status":          "success",
			"session_id":      currentSessionID,
			"chunks_received": len(currentSession.Chunks),
		},
	}
}

func (wsc *WsController) finishedUpload(sessionID string) EventEnvelopeResponse {
	log.Printf("Finishing upload for session: %s", sessionID)

	session, exists := uploadSessions[sessionID]
	if !exists {
		log.Printf("Session not found: %s", sessionID)
		return EventEnvelopeResponse{
			Event: EventEnvelopeEventFinishedUpload,
			Data:  map[string]string{"status": "error", "message": "session_not_found"},
		}
	}

	// 全チャンクを結合
	var completeFile []byte
	for _, chunk := range session.Chunks {
		completeFile = append(completeFile, chunk...)
	}

	log.Printf("Assembled complete file: %s, size: %d bytes from %d chunks",
		session.FileName, len(completeFile), len(session.Chunks))

	// ファイルを保存
	filePath, err := wsc.UploadFileChunkService.Execute(completeFile, session.FileName)
	if err != nil {
		log.Printf("Error saving complete file: %v", err)
		return EventEnvelopeResponse{
			Event: EventEnvelopeEventFinishedUpload,
			Data:  map[string]string{"status": "error", "message": "save_failed"},
		}
	}

	// セッションをクリーンアップ
	session.IsActive = false
	delete(uploadSessions, sessionID)

	log.Printf("Upload completed successfully for file: %s, saved at: %s", session.FileName, *filePath)

	return EventEnvelopeResponse{
		Event: EventEnvelopeEventFinishedUpload,
		Data: map[string]interface{}{
			"status":     "completed",
			"filename":   session.FileName,
			"file_path":  filePath,
			"total_size": session.TotalSize,
		},
	}
}
