package service

import (
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/jmoiron/sqlx"
)

type RegistrationUserService struct {
	Conn     sqlx.DB
	UserRepo repository.UserRepositoryInterface
}

func (service *RegistrationUserService) Execute(sess *session.Session, email string, password string, icon string) error {
	tx, err := service.Conn.Beginx()
	if err != nil {
		return err
	}

	err = service.UserRepo.Registration(*tx, email, password, icon)
	if err != nil {
		tx.Rollback()
		return err
	}

	tx.Commit()

	return nil
}
