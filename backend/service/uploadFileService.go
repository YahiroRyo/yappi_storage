package service

import (
	"mime/multipart"

	"github.com/YahiroRyo/yappi_storage/backend/helper"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/gofiber/fiber/v2/middleware/session"
)

type UploadFileService struct {
	UserRepo    repository.UserRepositoryInterface
	FileRepo    repository.FileRepositoryInterface
	ChatGPTRepo repository.ChatGPTRepositoryInterface
}

func (service *UploadFileService) Execute(sess *session.Session, fileHandler *multipart.FileHeader) (bool, error) {
	uploadingChunkID := sess.Get("uploading_chunk_id").(*string)
	if uploadingChunkID == nil {
		id, err := helper.GenerateSnowflake()
		if err != nil {
			return false, err
		}
		uploadingChunkID = id
	}

	return service.FileRepo.UploadChunk(*uploadingChunkID, fileHandler)
}
