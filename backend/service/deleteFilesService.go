package service

import (
	"errors"
	"sync"

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

	var result error
	var wg sync.WaitGroup
	for _, fileId := range fileIds {
		wg.Add(1)
		go func(fileId string) {
			defer wg.Done()
			err := service.FileRepo.DeleteFile(tx, user, fileId)
			if err != nil {
				result = errors.Join(result, err)
			}
		}(fileId)
	}

	wg.Wait()

	if result != nil {
		tx.Rollback()
		return result
	}

	tx.Commit()
	return nil
}
