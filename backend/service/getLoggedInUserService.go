package service

import (
	"github.com/cockroachdb/errors"

	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/jmoiron/sqlx"
)

type GetLoggedInUserService struct {
	Conn     *sqlx.DB
	UserRepo repository.UserRepositoryInterface
}

func (service *GetLoggedInUserService) Execute(sess *session.Session) (*user.User, error) {
	user, err := service.UserRepo.GetLoggedInUser(service.Conn, sess)
	if err != nil {
		return nil, errors.WithStack(err)
	}
	return user, nil
}
