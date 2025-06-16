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
	VideoCompressionService    service.VideoCompressionService
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
	log.Printf("WebSocket connection established from %s", c.RemoteAddr())

	// チャネルをバッファ付きにして、ブロッキングを防ぐ
	broadcast := make(chan EventEnvelopeResponse, 100)
	done := make(chan bool, 2) // 2つのgoroutineの終了を待つ

	// メッセージ読み取りgoroutine
	go func() {
		defer func() {
			log.Printf("Message reader goroutine exiting")
			done <- true
		}()

		for {
			messageType, message, err := c.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure, websocket.CloseNormalClosure) {
					log.Printf("WebSocket read error: %v", err)
				} else {
					log.Printf("WebSocket connection closed: %v", err)
				}
				return
			}

			log.Printf("Received message type: %d, size: %d bytes", messageType, len(message))

			if messageType == websocket.TextMessage {
				// テキストメッセージの処理
				var eventEnvelope EventEnvelope
				if err := json.Unmarshal(message, &eventEnvelope); err != nil {
					log.Printf("Error parsing text message: %v", err)
					response := EventEnvelopeResponse{
						Event: "error",
						Data:  map[string]string{"message": "invalid_json"},
					}
					select {
					case broadcast <- response:
					default:
						log.Printf("Broadcast channel full, skipping error response")
					}
					continue
				}

				log.Printf("Processing text event: %s", eventEnvelope.Event)

				var response EventEnvelopeResponse
				switch eventEnvelope.Event {
				case EventEnvelopeEventInitializeFileName:
					if dataMap, ok := eventEnvelope.Data.(map[string]interface{}); ok {
						if filename, exists := dataMap["filename"]; exists {
							if filenameStr, isString := filename.(string); isString {
								response = wsc.initializeFileName(filenameStr)
							} else {
								response = EventEnvelopeResponse{
									Event: EventEnvelopeEventInitializeFileName,
									Data:  map[string]string{"status": "error", "message": "filename_not_string"},
								}
							}
						} else {
							response = EventEnvelopeResponse{
								Event: EventEnvelopeEventInitializeFileName,
								Data:  map[string]string{"status": "error", "message": "filename_missing"},
							}
						}
					} else {
						response = EventEnvelopeResponse{
							Event: EventEnvelopeEventInitializeFileName,
							Data:  map[string]string{"status": "error", "message": "invalid_data_format"},
						}
					}
				case EventEnvelopeEventFinishedUpload:
					if sessionID, ok := eventEnvelope.Data.(string); ok {
						response = wsc.finishedUpload(sessionID)
					} else {
						response = EventEnvelopeResponse{
							Event: EventEnvelopeEventFinishedUpload,
							Data:  map[string]string{"status": "error", "message": "invalid_session_id"},
						}
					}
				default:
					log.Printf("Unknown event type: %s", eventEnvelope.Event)
					response = EventEnvelopeResponse{
						Event: "error",
						Data:  map[string]string{"message": "unknown_event"},
					}
				}

				select {
				case broadcast <- response:
				default:
					log.Printf("Broadcast channel full, skipping response")
				}

			} else if messageType == websocket.BinaryMessage {
				// バイナリメッセージの処理（ファイルチャンク）
				if len(message) < 8 {
					log.Printf("Binary message too short: %d bytes", len(message))
					response := EventEnvelopeResponse{
						Event: EventEnvelopeEventUploadFileChunk,
						Data:  map[string]string{"status": "error", "message": "invalid_chunk_size"},
					}
					select {
					case broadcast <- response:
					default:
						log.Printf("Broadcast channel full, skipping error response")
					}
					continue
				}

				// 最初の8バイトをCheckSumとして読み取り
				checksum := binary.BigEndian.Uint64(message[:8])
				chunk := message[8:]

				log.Printf("Processing binary chunk: checksum=%d, size=%d bytes", checksum, len(chunk))

				uploadData := UploadFileChunkData{
					Checksum: uint32(checksum),
					Chunk:    chunk,
				}

				response := wsc.uploadFileChunk(uploadData)
				select {
				case broadcast <- response:
				default:
					log.Printf("Broadcast channel full, skipping chunk response")
				}
			}
		}
	}()

	// メッセージ送信goroutine
	go func() {
		defer func() {
			log.Printf("Message writer goroutine exiting")
			done <- true
		}()

		for {
			select {
			case eventEnvelopeResponse := <-broadcast:
				// JSONでレスポンスを送信
				responseData, err := json.Marshal(eventEnvelopeResponse)
				if err != nil {
					log.Printf("Error marshaling response: %v", err)
					continue
				}

				log.Printf("Sending response: %s", eventEnvelopeResponse.Event)

				if err := c.WriteMessage(websocket.TextMessage, responseData); err != nil {
					log.Printf("Error sending response: %v", err)
					return
				}

			case <-done:
				// 読み取りgoroutineが終了した場合、こちらも終了
				return
			}
		}
	}()

	// 両方のgoroutineの終了を待つ
	<-done
	<-done

	// 接続終了時のクリーンアップ
	close(broadcast)
	log.Printf("WebSocket connection closed and cleaned up")
}
