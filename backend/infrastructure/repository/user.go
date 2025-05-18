package repository

import (
	"github.com/cockroachdb/errors"

	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/helper"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/database"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/jmoiron/sqlx"
)

type UserRepositoryInterface interface {
	GetLoggedInUser(conn *sqlx.DB, sess *session.Session) (*user.User, error)
	GetUserByToken(conn *sqlx.DB, token string) (*user.User, error)
	Login(tx *sqlx.Tx, email string, password string, sessionId string) (*user.User, error)
	Registration(tx *sqlx.Tx, email string, password string, icon string) error
	Logout(tx *sqlx.Tx, user user.User) error
	GenerateToken(tx *sqlx.Tx, user user.User) (*string, error)
}

type UserRepository struct {
}

func (repo *UserRepository) GetLoggedInUser(conn *sqlx.DB, sess *session.Session) (*user.User, error) {
	id := sess.Get("id")

	if id == nil || id == "" {
		return nil, errors.WithStack(NotFoundError{Code: 404, Message: "IDが存在しません。"})
	}

	row := conn.QueryRowx("SELECT * FROM users WHERE session_id = $1", id)
	if row == nil {
		return nil, errors.WithStack(errors.Join(NotFoundError{Code: 404, Message: "データが存在しません。"}, row.Err()))
	}

	var result database.User
	err := row.StructScan(&result)
	if err != nil {
		return nil, errors.WithStack(errors.Join(FieldSQLError{Code: 500, Message: "エラーが発生しました。"}, row.Err()))
	}

	user := result.ToEntity()

	return &user, nil
}

func (repo *UserRepository) GetUserByToken(conn *sqlx.DB, token string) (*user.User, error) {
	row := conn.QueryRowx("SELECT * FROM users WHERE token = $1", token)
	if row == nil {
		return nil, errors.WithStack(errors.Join(NotFoundError{Code: 404, Message: "データが存在しません。"}, row.Err()))
	}

	var result database.User
	err := row.StructScan(&result)
	if err != nil {
		return nil, errors.WithStack(errors.Join(FieldSQLError{Code: 500, Message: "エラーが発生しました。"}, row.Err()))
	}

	user := result.ToEntity()

	return &user, nil
}

func (repo *UserRepository) Login(tx *sqlx.Tx, email string, password string, sessionId string) (*user.User, error) {
	row := tx.QueryRowx("SELECT * FROM users WHERE email = $1", email)
	if row == nil {
		return nil, errors.WithStack(errors.Join(NotFoundError{Code: 404, Message: "メールアドレスが存在しません。"}, row.Err()))
	}

	var result database.User
	err := row.StructScan(&result)
	if err != nil {
		println(err.Error())
		return nil, errors.WithStack(errors.Join(NotFoundError{Code: 404, Message: "スキャンに失敗しました。"}, row.Err()))
	}

	if err := helper.CompareHashPassword(result.Password, password); err != nil {
		return nil, errors.WithStack(errors.Join(NotFoundError{Code: 404, Message: "パスワードが違います。"}, row.Err()))
	}

	_, err = tx.Exec("UPDATE users SET session_id = $1 WHERE id = $2", sessionId, result.ID)
	if err != nil {
		return nil, errors.WithStack(errors.Join(FieldSQLError{Code: 500, Message: "エラーが発生しました。"}, row.Err()))
	}

	user := result.ToEntity()

	return &user, nil
}

func (repo *UserRepository) Registration(tx *sqlx.Tx, email string, password string, icon string) error {
	id, err := helper.GenerateSnowflake()
	if err != nil {
		return errors.WithStack(err)
	}

	_, err = tx.Exec("INSERT INTO users (id, email, password, icon) VALUES ($1, $2, $3, $4)", id, email, password, icon)
	if err != nil {
		return errors.WithStack(errors.Join(FieldSQLError{Code: 500, Message: "エラーが発生しました。"}, err))
	}

	return nil
}

func (repo *UserRepository) Logout(tx *sqlx.Tx, user user.User) error {
	_, err := tx.Exec("UPDATE users SET session_id = NULL")
	if err != nil {
		return errors.WithStack(errors.Join(FieldSQLError{Code: 500, Message: "エラーが発生しました。"}, err))
	}

	return nil
}

func (repo *UserRepository) GenerateToken(tx *sqlx.Tx, user user.User) (*string, error) {
	token, err := helper.GenerateSnowflake()
	if err != nil {
		return nil, errors.WithStack(err)
	}

	args := map[string]any{
		"token":   token,
		"user_id": user.ID,
	}

	_, err = tx.NamedExec("UPDATE users SET token = :token WHERE id = :user_id", args)
	if err != nil {
		return nil, errors.WithStack(errors.Join(FieldSQLError{Code: 500, Message: "エラーが発生しました。"}, err))
	}

	return token, nil
}
