package service

import (
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
		return nil, err
	}

	token, err := service.UserRepo.GenerateToken(tx, user)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	tx.Commit()
	return token, nil
}
