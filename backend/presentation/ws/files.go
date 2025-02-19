package ws

import (
	"fmt"
	"log"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/YahiroRyo/yappi_storage/backend/helper"
	"github.com/gofiber/contrib/websocket"
)

// type MessageCommand = int

const (
	File = iota
	InitializeFileName
	FinishedUpload
)

func (wsc *WsController) UploadFile(c *websocket.Conn) {
	var (
		filename string
		url      *string
	)

	var (
		messageType int
		message     []byte
		err         error
	)

	for {
		if messageType, message, err = c.ReadMessage(); err != nil {
			log.Println("read:", err)
			break
		}

		if len(message) == 0 {
			continue
		}

		if messageType == websocket.TextMessage {
			parts := strings.Split(string(message), ",")
			messageCommand, err := strconv.Atoi(parts[0])
			content := parts[1]

			if err != nil {
				log.Println("strconv atoi:", err)
				break
			}

			if messageCommand == InitializeFileName {
				id, err := helper.GenerateSnowflake()
				if err != nil {
					log.Println("snowflake:", err)
					break
				}
				filename = fmt.Sprintf("%s%s", *id, filepath.Ext(string(content)))
			}

			if messageCommand == FinishedUpload {
				if err = c.WriteMessage(websocket.TextMessage, []byte(*url)); err != nil {
					log.Println("write:", err)
					break
				}
			}
			continue
		}

		url, err = wsc.UploadFileChunkService.Execute(message, filename)
		if err != nil {
			log.Println("UploadFileChunkService:", err)
			break
		}
	}

}
