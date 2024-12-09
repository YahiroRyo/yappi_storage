package service

import (
	"github.com/jmoiron/sqlx"

	"github.com/YahiroRyo/yappi_storage/backend/domain/file"
	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
)

type SearchFilesService struct {
	Conn        *sqlx.DB
	FileRepo    repository.FileRepositoryInterface
	ChatGPTRepo repository.ChatGPTRepositoryInterface
}

func (service *SearchFilesService) Execute(user user.User, query string, currentPageCount int, pageSize int) (*file.Files, error) {
	embedding, err := service.ChatGPTRepo.GetEmbedding(query)
	if err != nil {
		return nil, err
	}

	return service.FileRepo.SearchFiles(service.Conn, user, *embedding, currentPageCount, pageSize)
}
