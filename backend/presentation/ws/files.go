package ws

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/YahiroRyo/yappi_storage/backend/helper"
)

type UploadFileChunkData struct {
	Checksum uint32
	Chunk    []byte
}

type UploadSession struct {
	FileName  string
	FileID    string
	Chunks    [][]byte
	TotalSize int64
	IsActive  bool
	StartTime time.Time
}

var uploadSessions = make(map[string]*UploadSession)

func (wsc *WsController) initializeFileName(filename string) EventEnvelopeResponse {
	log.Printf("Initializing file upload for: %s", filename)

	// ファイルIDを生成
	fileID, err := helper.GenerateSnowflake()
	if err != nil {
		log.Printf("Error generating file ID: %v", err)
		return EventEnvelopeResponse{
			Event: EventEnvelopeEventInitializeFileName,
			Data:  map[string]string{"status": "error", "message": "failed_to_generate_file_id"},
		}
	}

	// 一意のセッションIDを生成
	sessionID := fmt.Sprintf("%s_%d", filename, time.Now().UnixNano())
	uploadSessions[sessionID] = &UploadSession{
		FileName:  filename,
		FileID:    *fileID,
		Chunks:    make([][]byte, 0),
		TotalSize: 0,
		IsActive:  true,
		StartTime: time.Now(),
	}

	return EventEnvelopeResponse{
		Event: EventEnvelopeEventInitializeFileName,
		Data:  map[string]string{"session_id": sessionID, "file_id": *fileID, "status": "initialized"},
	}
}

func (wsc *WsController) uploadFileChunk(data UploadFileChunkData) EventEnvelopeResponse {
	log.Printf("Received file chunk with checksum: %d, size: %d bytes", data.Checksum, len(data.Chunk))

	// CheckSumの検証
	if !helper.CalculateChecksum(data.Chunk, data.Checksum) {
		log.Printf("Checksum verification failed for chunk")
		return EventEnvelopeResponse{
			Event: EventEnvelopeEventUploadFileChunk,
			Data: map[string]interface{}{
				"status":         "error",
				"error_type":     "checksum_mismatch",
				"message":        "チェックサムが一致しません。リトライしてください。",
				"retry_required": true,
			},
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

	// ファイルを保存（ファイルID + 拡張子のファイル名で保存）
	uploadResult, err := wsc.UploadFileChunkService.Execute(completeFile, session.FileID, session.FileName)
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

	log.Printf("Upload completed successfully for file: %s, saved at: %s (local: %s)",
		session.FileName, uploadResult.URL, uploadResult.LocalPath)

	// 動画ファイルの場合は非同期で圧縮処理を開始
	if wsc.VideoCompressionService.IsVideoFile(session.FileName) {
		log.Printf("Video file detected: %s, starting compression", session.FileName)

		// 圧縮後のファイル名を生成（ファイルID + _compressed + 拡張子）
		compressedFilename := session.FileID + "_compressed.mp4"

		// アップロード結果から実際のローカルパスを使用
		inputPath := uploadResult.LocalPath

		// 圧縮後のファイル用のストレージパスを取得
		storagePath, err := wsc.GetStoreStoragePathService.Execute()
		if err != nil {
			log.Printf("Error getting storage path: %v", err)
		} else {
			outputPath := fmt.Sprintf("storage/files/%s/%s", storagePath, compressedFilename)

			// 非同期で圧縮処理を実行
			go func() {
				log.Printf("Starting background video compression: %s -> %s", inputPath, outputPath)

				err := wsc.VideoCompressionService.CompressVideo(inputPath, outputPath)
				if err != nil {
					log.Printf("Video compression failed: %v", err)
				} else {
					log.Printf("Video compression completed successfully: %s", outputPath)

					// 圧縮に成功した場合、元ファイルを削除
					if err := os.Remove(inputPath); err != nil {
						log.Printf("Warning: Failed to delete original file %s: %v", inputPath, err)
					} else {
						log.Printf("Original video file deleted: %s", inputPath)
					}
				}
			}()
		}
	}

	return EventEnvelopeResponse{
		Event: EventEnvelopeEventFinishedUpload,
		Data: map[string]interface{}{
			"status":     "completed",
			"filename":   session.FileName,
			"file_path":  uploadResult.URL,
			"total_size": session.TotalSize,
		},
	}
}
