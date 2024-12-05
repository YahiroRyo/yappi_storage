package repository

import "github.com/YahiroRyo/yappi_storage/backend/domain/file"

type FileRepositoryInterface interface {
	GetFiles() (file.File, error)
}

type FileRepository struct {
}

func (repo *FileRepository) GetFiles() (file.File, error) {
}
