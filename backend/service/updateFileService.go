package service

import (
	"github.com/YahiroRyo/yappi_storage/backend/domain/file"
	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/jmoiron/sqlx"
)

type UpdateFileService struct {
	Conn     *sqlx.DB
	FileRepo repository.FileRepositoryInterface
}

func (service *UpdateFileService) Execute(user user.User, file file.File) (*file.File, error) {
	tx, err := service.Conn.Beginx()
	if err != nil {
		return nil, err
	}

	return service.FileRepo.UpdateFile(tx, user, file)
}
