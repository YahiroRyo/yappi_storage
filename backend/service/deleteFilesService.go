package service

import (
	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/jmoiron/sqlx"
)

type DeleteFilesService struct {
	Conn     *sqlx.DB
	FileRepo repository.FileRepositoryInterface
}

func (service *DeleteFilesService) Execute(user user.User, fileIds []string) error {
	tx, err := service.Conn.Beginx()
	if err != nil {
		return err
	}

	for _, fileId := range fileIds {
		err = service.FileRepo.DeleteFile(tx, user, fileId)
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	tx.Commit()
	return nil
}
