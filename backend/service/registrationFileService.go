package service

import (
	"time"

	"github.com/YahiroRyo/yappi_storage/backend/domain/file"
	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/helper"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/jmoiron/sqlx"
)

type RegistrationFileService struct {
	Conn        *sqlx.DB
	UserRepo    repository.UserRepositoryInterface
	FileRepo    repository.FileRepositoryInterface
	ChatGPTRepo repository.ChatGPTRepositoryInterface
}

func (service *RegistrationFileService) Execute(user user.User, url string, kind file.FileKind, name string, parentDirectoryID *string) (*file.File, error) {
	tx, err := service.Conn.Beginx()
	if err != nil {
		return nil, err
	}

	generatedID, err := helper.GenerateSnowflake()
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	file := file.File{
		ID:                *generatedID,
		UserID:            user.ID,
		ParentDirectoryID: parentDirectoryID,
		Url:               &url,
		Embedding:         nil,
		Kind:              kind.ToEnString(),
		Name:              name,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	uploadedFile, err := service.FileRepo.RegistrationFile(tx, user, file)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	tx.Commit()

	return uploadedFile, nil
}
