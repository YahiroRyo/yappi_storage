package service

import (
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
)

type UploadFileChunkService struct {
	FileRepo repository.FileRepositoryInterface
}

func (service *UploadFileChunkService) Execute(file []byte) (bool, error) {

}