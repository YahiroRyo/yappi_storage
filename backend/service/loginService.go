package service

import (
	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/helper"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/jmoiron/sqlx"
)

type LoginService struct {
	Conn     sqlx.DB
	UserRepo repository.UserRepositoryInterface
}

func (service *LoginService) Execute(sess *session.Session, email string, password string) (*user.User, error) {
	sessionId, err := helper.GenerateSnowflake()
	if err != nil {
		return nil, err
	}

	sess.Set("id", sessionId)

	tx, err := service.Conn.Beginx()
	if err != nil {
		return nil, err
	}

	user, err := service.UserRepo.Login(*tx, email, password, *sessionId)
	if err != nil {
		return nil, err
	}

	return user, err
}
