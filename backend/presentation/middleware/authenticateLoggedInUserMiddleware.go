package middleware

import (
	"github.com/cockroachdb/errors"

	"github.com/YahiroRyo/yappi_storage/backend/presentation/session"
	"github.com/gofiber/fiber/v2"
)

func (m *Middleware) AuthenticateLoggedInUserMiddleware(ctx *fiber.Ctx) error {
	sess, err := session.GetSession(ctx)
	if err != nil {
		return errors.WithStack(err)
	}

	_, err = m.GetLoggedInUserService.Execute(sess)
	if err != nil {
		return errors.WithStack(NotLoggedInError{Code: 401, Message: "ログインを行ってください。"})
	}

	return ctx.Next()
}
