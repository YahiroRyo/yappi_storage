package service

import (
	"strconv"
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

func (service *RegistrationFileService) Execute(user user.User, url string, parentDirectoryID *int64) (*file.File, error) {
	tx, err := service.Conn.Beginx()
	if err != nil {
		return nil, err
	}

	generatedID, err := helper.GenerateSnowflake()
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	id, err := strconv.ParseInt(*generatedID, 10, 64)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	file := file.File{
		ID:                id,
		UserID:            user.ID,
		ParentDirectoryID: parentDirectoryID,
		Url:               &url,
		Embedding:         nil,
		Kind:              file.Unknown,
		Name:              "",
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
