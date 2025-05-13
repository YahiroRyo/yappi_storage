package service

import (
	"time"

	"github.com/YahiroRyo/yappi_storage/backend/domain/file"
	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/helper"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/request"
	"github.com/jmoiron/sqlx"
)

type RegistrationFilesService struct {
	Conn        *sqlx.DB
	UserRepo    repository.UserRepositoryInterface
	FileRepo    repository.FileRepositoryInterface
	ChatGPTRepo repository.ChatGPTRepositoryInterface
}

func (service *RegistrationFilesService) Execute(user user.User, registrationFiles request.RegistrationFilesRequest) ([]file.File, error) {
	tx, err := service.Conn.Beginx()
	if err != nil {
		return nil, err
	}

	uploadedFiles := []file.File{}

	for _, registrationFile := range registrationFiles.RegistrationFiles {
		generatedID, err := helper.GenerateSnowflake()
		if err != nil {
			tx.Rollback()
			return nil, err
		}

		file := file.File{
			ID:                *generatedID,
			UserID:            user.ID,
			ParentDirectoryID: registrationFile.ParentDirectoryId,
			Url:               &registrationFile.Url,
			Embedding:         nil,
			Kind:              file.FileKindFromEnString(registrationFile.Kind).ToEnString(),
			Name:              registrationFile.Name,
			CreatedAt:         time.Now(),
			UpdatedAt:         time.Now(),
		}

		uploadedFile, err := service.FileRepo.RegistrationFile(tx, user, file)
		if err != nil {
			tx.Rollback()
			return nil, err
		}

		uploadedFiles = append(uploadedFiles, *uploadedFile)
	}

	tx.Commit()

	return uploadedFiles, nil
}
