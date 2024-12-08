package session

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/session"
)

func GetSession(ctx *fiber.Ctx) (*session.Session, error) {
	store := session.New()
	sess, err := store.Get(ctx)
	if err != nil {
		return nil, err
	}

	return sess, nil
}
