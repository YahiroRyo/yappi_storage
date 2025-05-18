package service

import (
	"github.com/cockroachdb/errors"

	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/jmoiron/sqlx"
)

type LogoutService struct {
	Conn     *sqlx.DB
	UserRepo repository.UserRepositoryInterface
}

func (service *LogoutService) Execute(sess *session.Session) error {
	tx, err := service.Conn.Beginx()
	if err != nil {
		return errors.WithStack(err)
	}

	user, err := service.UserRepo.GetLoggedInUser(service.Conn, sess)
	if err != nil {
		tx.Rollback()
		return errors.WithStack(err)
	}

	err = service.UserRepo.Logout(tx, *user)
	if err != nil {
		tx.Rollback()
		return errors.WithStack(err)
	}

	if err := tx.Commit(); err != nil {
		return errors.WithStack(err)
	}

	return nil
}
