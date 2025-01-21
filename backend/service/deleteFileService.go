package service

import (
	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/jmoiron/sqlx"
)

type DeleteFileService struct {
	Conn     *sqlx.DB
	FileRepo repository.FileRepositoryInterface
}

func (service *DeleteFileService) Execute(user user.User, id string) error {
	tx, err := service.Conn.Beginx()
	if err != nil {
		return err
	}

	err = service.FileRepo.DeleteFile(tx, user, id)
	if err != nil {
		tx.Rollback()
		return err
	}

	tx.Commit()
	return nil
}
