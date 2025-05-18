package session

import (
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/gofiber/fiber/v2/utils"
	"github.com/gofiber/storage/sqlite3"
)

var storage = sqlite3.New(sqlite3.ConfigDefault)
var store = session.New(session.Config{
	Storage:      storage,
	Expiration:   24 * time.Hour,
	KeyLookup:    "cookie:session_id",
	KeyGenerator: utils.UUIDv4,
	CookieDomain: os.Getenv("HOSTNAME"),
})

func GetSession(ctx *fiber.Ctx) (*session.Session, error) {
	sess, err := store.Get(ctx)

	if err != nil {
		return nil, err
	}

	return sess, nil
}
