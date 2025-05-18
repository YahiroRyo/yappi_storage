package service

import (
	"github.com/YahiroRyo/yappi_storage/backend/domain/file"
	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/jmoiron/sqlx"
)

type RenameFileService struct {
	Conn     *sqlx.DB
	FileRepo repository.FileRepositoryInterface
}

func (service *RenameFileService) Execute(user user.User, fileId string, name string) (*file.File, error) {
	tx, err := service.Conn.Beginx()
	if err != nil {
		return nil, err
	}

	f, err := service.FileRepo.GetFileByID(service.Conn, user, fileId)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	renameFile := file.File{
		ID:                f.ID,
		UserID:            f.UserID,
		ParentDirectoryID: f.ParentDirectoryID,
		// Embedding:         f.Embedding,
		Kind:      f.Kind,
		Url:       f.Url,
		Name:      name,
		CreatedAt: f.CreatedAt,
		UpdatedAt: f.UpdatedAt,
	}

	file, err := service.FileRepo.UpdateFile(tx, user, renameFile)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	tx.Commit()

	return file, nil
}
