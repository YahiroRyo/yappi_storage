package service

import (
	"path/filepath"

	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
)

type UploadFileChunkService struct {
	FileRepo repository.FileRepositoryInterface
}

func (service *UploadFileChunkService) Execute(file []byte, fileID string, originalFilename string) (*string, error) {
	// 拡張子を取得
	ext := filepath.Ext(originalFilename)

	// ファイルID + 拡張子のファイル名を生成
	filename := fileID + ext

	return service.FileRepo.UploadFileChunk(file, filename)
}
