package ws

import (
	"encoding/binary"
	"encoding/json"
	"log"

	"github.com/YahiroRyo/yappi_storage/backend/service"
	"github.com/gofiber/contrib/websocket"
)

type WsController struct {
	UploadFileChunkService     service.UploadFileChunkService
	GetLoggedInUserService     service.GetLoggedInUserService
	GetStorageSettingService   service.GetStorageSettingService
	GetStoreStoragePathService service.GetStoreStoragePathService
}

type EventEnvelopeEvent string

type EventEnvelope struct {
	Event EventEnvelopeEvent
	Data  any
}
type EventEnvelopeResponse struct {
	Event EventEnvelopeEvent
	Data  any
}

const (
	EventEnvelopeEventInitializeFileName EventEnvelopeEvent = "initialize_file_name"
	EventEnvelopeEventUploadFileChunk    EventEnvelopeEvent = "upload_file_chunk"
	EventEnvelopeEventFinishedUpload     EventEnvelopeEvent = "finished_upload"
)

func (wsc *WsController) Ws(c *websocket.Conn) {
	broadcast := make(chan EventEnvelopeResponse)

	go func() {
		for {
			messageType, message, err := c.ReadMessage()
			if err != nil {
				log.Println(err)
				break
			}

			if messageType == websocket.TextMessage {
				// テキストメッセージの処理
				var eventEnvelope EventEnvelope
				if err := json.Unmarshal(message, &eventEnvelope); err != nil {
					log.Printf("Error parsing text message: %v", err)
					continue
				}

				switch eventEnvelope.Event {
				case EventEnvelopeEventInitializeFileName:
					if filename, ok := eventEnvelope.Data.(string); ok {
						broadcast <- wsc.initializeFileName(filename)
					}
				case EventEnvelopeEventFinishedUpload:
					if sessionID, ok := eventEnvelope.Data.(string); ok {
						broadcast <- wsc.finishedUpload(sessionID)
					}
				}
			} else if messageType == websocket.BinaryMessage {
				// バイナリメッセージの処理（ファイルチャンク）
				if len(message) < 8 {
					log.Printf("Binary message too short: %d bytes", len(message))
					continue
				}

				// 最初の8バイトをCheckSumとして読み取り
				checksum := binary.BigEndian.Uint64(message[:8])
				chunk := message[8:]

				uploadData := UploadFileChunkData{
					Checksum: checksum,
					Chunk:    chunk,
				}

				broadcast <- wsc.uploadFileChunk(uploadData)
			}
		}
	}()

	go func() {
		for {
			eventEnvelopeResponse := <-broadcast

			// JSONでレスポンスを送信
			responseData, err := json.Marshal(eventEnvelopeResponse)
			if err != nil {
				log.Printf("Error marshaling response: %v", err)
				continue
			}

			if err := c.WriteMessage(websocket.TextMessage, responseData); err != nil {
				log.Printf("Error sending response: %v", err)
				break
			}
		}
	}()
}
