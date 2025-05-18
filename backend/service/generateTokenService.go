package service

import (
	"github.com/cockroachdb/errors"

	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/jmoiron/sqlx"
)

type GenerateTokenService struct {
	Conn     *sqlx.DB
	UserRepo repository.UserRepositoryInterface
}

func (service *GenerateTokenService) Execute(user user.User) (*string, error) {
	tx, err := service.Conn.Beginx()
	if err != nil {
		return nil, errors.WithStack(err)
	}

	token, err := service.UserRepo.GenerateToken(tx, user)
	if err != nil {
		tx.Rollback()
		return nil, errors.WithStack(err)
	}

	if err := tx.Commit(); err != nil {
		return nil, errors.WithStack(err)
	}

	return token, nil
}
