package service

import (
	"time"

	"github.com/cockroachdb/errors"

	"github.com/YahiroRyo/yappi_storage/backend/domain/file"
	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/helper"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/jmoiron/sqlx"
)

type RegistrationDirectoryService struct {
	Conn        *sqlx.DB
	UserRepo    repository.UserRepositoryInterface
	FileRepo    repository.FileRepositoryInterface
	ChatGPTRepo repository.ChatGPTRepositoryInterface
}

func (service *RegistrationDirectoryService) Execute(user user.User, name string, parentDirectoryID *string) (*file.File, error) {
	tx, err := service.Conn.Beginx()
	if err != nil {
		return nil, errors.WithStack(err)
	}

	generatedID, err := helper.GenerateSnowflake()
	if err != nil {
		tx.Rollback()
		return nil, errors.WithStack(err)
	}

	file := file.File{
		ID:                *generatedID,
		UserID:            user.ID,
		ParentDirectoryID: parentDirectoryID,
		Url:               nil,
		// Embedding:         nil,
		Kind:      file.Directory.ToEnString(),
		Name:      name,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	uploadedFile, err := service.FileRepo.RegistrationFile(tx, user, file)
	if err != nil {
		tx.Rollback()
		return nil, errors.WithStack(err)
	}

	if err := tx.Commit(); err != nil {
		return nil, errors.WithStack(err)
	}

	return uploadedFile, nil
}
