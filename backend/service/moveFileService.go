package service

import (
	"errors"

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

	for _, fileId := range fileIds {
		f, err := service.FileRepo.GetFileByID(service.Conn, user, fileId)
		if err != nil {
			tx.Rollback()
			return nil, err
		}

		if f.ParentDirectoryID != nil && *f.ParentDirectoryID == afterParentDirectoryId {
			return nil, errors.New("ファイルはすでに指定のディレクトリにあります")
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
			tx.Rollback()
			return nil, err
		}

		files = append(files, *file)
	}

	tx.Commit()
	return files, nil
}
