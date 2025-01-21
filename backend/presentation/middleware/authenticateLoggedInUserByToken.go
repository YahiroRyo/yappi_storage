package middleware

import (
	"github.com/gofiber/fiber/v2"
)

func (m *Middleware) AuthenticateLoggedInUserMiddlewareByToken(ctx *fiber.Ctx) error {
	token := ctx.Get("Authorization")

	_, err := m.GetUserByTokenService.Execute(token)
	if err != nil {
		return NotLoggedInError{Code: 401, Message: "使用不可能なトークンです"}
	}

	return ctx.Next()
}
