package service

import (
	"github.com/jmoiron/sqlx"

	"github.com/YahiroRyo/yappi_storage/backend/domain/file"
	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
)

type GetFileService struct {
	Conn     *sqlx.DB
	FileRepo repository.FileRepositoryInterface
}

func (service *GetFileService) Execute(user user.User, id string) (*file.File, error) {
	return service.FileRepo.GetFileByID(service.Conn, user, id)
}
