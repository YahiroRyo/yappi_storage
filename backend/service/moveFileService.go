package service

import (
	"github.com/YahiroRyo/yappi_storage/backend/domain/file"
	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/jmoiron/sqlx"
)

type MoveFileService struct {
	Conn     *sqlx.DB
	FileRepo repository.FileRepositoryInterface
}

func (service *MoveFileService) Execute(user user.User, fileId string, afterParentDirectoryId string) (*file.File, error) {
	tx, err := service.Conn.Beginx()
	if err != nil {
		return nil, err
	}

	f, err := service.FileRepo.GetFileByID(service.Conn, user, fileId)
	if err != nil {
		tx.Rollback()
		return nil, err
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

	return service.FileRepo.UpdateFile(tx, user, movedDirectoryFile)
}
