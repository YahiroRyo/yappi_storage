package service

import (
	"github.com/cockroachdb/errors"

	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/helper"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/jmoiron/sqlx"
)

type LoginService struct {
	Conn     *sqlx.DB
	UserRepo repository.UserRepositoryInterface
}

func (service *LoginService) Execute(sess *session.Session, email string, password string) (*user.User, error) {
	sessionId, err := helper.GenerateSnowflake()
	if err != nil {
		return nil, errors.WithStack(err)
	}

	sess.Set("id", sessionId)

	if err := sess.Save(); err != nil {
		return nil, errors.WithStack(err)
	}

	tx, err := service.Conn.Beginx()
	if err != nil {
		return nil, errors.WithStack(err)
	}

	user, err := service.UserRepo.Login(tx, email, password, *sessionId)
	if err != nil {
		tx.Rollback()
		return nil, errors.WithStack(err)
	}

	if err := tx.Commit(); err != nil {
		return nil, errors.WithStack(err)
	}

	return user, nil
}
