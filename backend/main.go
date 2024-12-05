package main

import (
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/route"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/controller"
	"github.com/goccy/go-json"
	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New(fiber.Config{
		JSONEncoder: json.Marshal,
		JSONDecoder: json.Unmarshal,
	})

	route.SetRoutes(app, controller.Controller{})

	app.Listen(":8000")
}
