package service

import (
	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/jmoiron/sqlx"
)

type GetUserByTokenService struct {
	Conn     *sqlx.DB
	UserRepo repository.UserRepositoryInterface
}

func (service *GetUserByTokenService) Execute(token string) (*user.User, error) {
	return service.UserRepo.GetUserByToken(service.Conn, token)
}
