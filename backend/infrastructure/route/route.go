package route

import (
	"github.com/YahiroRyo/yappi_storage/backend/presentation/controller"
	"github.com/gofiber/fiber/v2"
)

func SetRoutes(app *fiber.App, controller controller.Controller) {
	files := app.Group("/files")
	{
		files.Get("/", controller.GetFiles)
	}
}
