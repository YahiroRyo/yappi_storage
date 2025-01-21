package service

import (
	"github.com/jmoiron/sqlx"

	"github.com/YahiroRyo/yappi_storage/backend/domain/file"
	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
)

type GetFilesService struct {
	Conn     *sqlx.DB
	FileRepo repository.FileRepositoryInterface
}

func (service *GetFilesService) Execute(user user.User, parentDirectoryId *string, currentPageCount int, pageSize int) (*file.Files, error) {
	return service.FileRepo.GetFiles(service.Conn, user, parentDirectoryId, currentPageCount, pageSize)
}
