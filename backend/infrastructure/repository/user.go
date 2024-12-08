package repository

import (
	"errors"

	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/helper"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/jmoiron/sqlx"
)

type UserRepositoryInterface interface {
	GetLoggedInUser(conn sqlx.DB, sess *session.Session) (*user.User, error)
	Login(tx sqlx.Tx, email string, password string, sessionId string) (*user.User, error)
	Registration(tx sqlx.Tx, email string, password string, icon string) error
	Logout(tx sqlx.Tx, user user.User) error
}

type UserRepository struct {
}

func (repo *UserRepository) GetLoggedInUser(conn sqlx.DB, sess *session.Session) (*user.User, error) {
	row := conn.QueryRow("SELECT id, email, password, icon, session_id, created_at WHERE session_id = ?", sess.Get("id"))
	if row == nil {
		return nil, errors.Join(NotFoundError{Code: 404, Message: "データが存在しません。"}, row.Err())
	}

	var result user.User
	row.Scan(&result)

	return &result, nil
}

func (repo *UserRepository) Login(tx sqlx.Tx, email string, password string, sessionId string) (*user.User, error) {
	row := tx.QueryRow("SELECT * FROM users WHERE email = ? AND password = ?", email, password)
	if row == nil {
		return nil, errors.Join(NotFoundError{Code: 404, Message: "データが存在しません。"}, row.Err())
	}

	var result user.User
	row.Scan(&result)

	_, err := tx.Exec("UPDATE users SET session_id = ? WEHRE id = ?", sessionId, result.ID)
	if err != nil {
		return nil, errors.Join(FieldSQLError{Code: 500, Message: "エラーが発生しました。"}, row.Err())
	}

	return &result, nil
}

func (repo *UserRepository) Registration(tx sqlx.Tx, email string, password string, icon string) error {
	id, err := helper.GenerateSnowflake()
	if err != nil {
		return err
	}

	_, err = tx.Exec("INSERT INTO users (id, email, password, icon) VALUES (:id, :email, :password, :icon)", id, email, password, icon)
	if err != nil {
		return errors.Join(FieldSQLError{Code: 500, Message: "エラーが発生しました。"}, err)
	}

	return nil
}

func (repo *UserRepository) Logout(tx sqlx.Tx, user user.User) error {
	_, err := tx.Exec("UPDATE users SET session_id = NULL")
	if err != nil {
		return errors.Join(FieldSQLError{Code: 500, Message: "エラーが発生しました。"}, err)
	}

	return nil
}
