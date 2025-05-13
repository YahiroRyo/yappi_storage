package service

import (
	"errors"
	"sync"

	"github.com/YahiroRyo/yappi_storage/backend/domain/file"
	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/jmoiron/sqlx"
)

type MoveFilesService struct {
	Conn     *sqlx.DB
	FileRepo repository.FileRepositoryInterface
}

func (service *MoveFilesService) Execute(user user.User, fileIds []string, afterParentDirectoryId string) ([]file.File, error) {
	tx, err := service.Conn.Beginx()
	if err != nil {
		return nil, err
	}

	files := []file.File{}

	var result error
	var wg sync.WaitGroup
	for _, fileId := range fileIds {
		wg.Add(1)
		go func(fileId string) {
			f, err := service.FileRepo.GetFileByID(service.Conn, user, fileId)
			if err != nil {
				result = errors.Join(result, err)
				return
			}

			if f.ParentDirectoryID != nil && *f.ParentDirectoryID == afterParentDirectoryId {
				result = errors.Join(result, errors.New("ファイルはすでに指定のディレクトリにあります"))
				return
			}

			movedDirectoryFile := file.File{
				ID:                f.ID,
				UserID:            f.UserID,
				ParentDirectoryID: &afterParentDirectoryId,
				Embedding:         f.Embedding,
				Kind:              f.Kind,
				Url:               f.Url,
				Name:              f.Name,
				CreatedAt:         f.CreatedAt,
				UpdatedAt:         f.UpdatedAt,
			}

			file, err := service.FileRepo.UpdateFile(tx, user, movedDirectoryFile)
			if err != nil {
				result = errors.Join(result, err)
				return
			}

			files = append(files, *file)
		}(fileId)
	}

	wg.Wait()

	if result != nil {
		tx.Rollback()
		return nil, result
	}

	return files, nil
}
