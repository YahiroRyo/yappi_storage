package ws

import (
	"fmt"
	"log"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/YahiroRyo/yappi_storage/backend/helper"
	"github.com/cockroachdb/errors"
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
		dirname  string
		url      *string
	)

	var (
		messageType int
		message     []byte
		err         error
	)

	for {
		if messageType, message, err = c.ReadMessage(); err != nil {
			log.Println("read:", errors.WithStack(err))
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
				log.Println("strconv atoi:", errors.WithStack(err))
				break
			}

			if messageCommand == InitializeFileName {
				storeStoragePath, err := wsc.GetStoreStoragePathService.Execute()
				if err != nil {
					log.Println("GetStorageSettingService:", errors.WithStack(err))
					break
				}

				id, err := helper.GenerateSnowflake()
				if err != nil {
					log.Println("snowflake:", errors.WithStack(err))
					break
				}
				filename = fmt.Sprintf("%s%s", *id, filepath.Ext(string(content)))
				dirname = fmt.Sprintf("%s/%s", storeStoragePath, filename)
			}

			if messageCommand == FinishedUpload {
				if err = c.WriteMessage(websocket.TextMessage, []byte(*url)); err != nil {
					log.Println("write:", errors.WithStack(err))
					break
				}
			}
			continue
		}

		url, err = wsc.UploadFileChunkService.Execute(message, dirname)
		if err != nil {
			log.Println("UploadFileChunkService:", errors.WithStack(err))
			break
		}
	}

}
