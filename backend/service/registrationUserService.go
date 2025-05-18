package service

import (
	"github.com/cockroachdb/errors"

	"github.com/YahiroRyo/yappi_storage/backend/helper"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/jmoiron/sqlx"
)

type RegistrationUserService struct {
	Conn     *sqlx.DB
	UserRepo repository.UserRepositoryInterface
}

func (service *RegistrationUserService) Execute(sess *session.Session, email string, password string, icon string) error {
	tx, err := service.Conn.Beginx()
	if err != nil {
		return err
	}

	encriptedPassword, err := helper.EncryptPassword(password)
	if err != nil {
		tx.Rollback()
		return err
	}

	err = service.UserRepo.Registration(tx, email, encriptedPassword, icon)
	if err != nil {
		tx.Rollback()
		return errors.Join(AlreadyUsedEmailAddressError{Code: 400, Message: "すでに使用しているメールアドレスです。"}, err)
	}

	tx.Commit()

	return nil
}
