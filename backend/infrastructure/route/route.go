package route

import (
	"github.com/YahiroRyo/yappi_storage/backend/presentation/controller"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/middleware"
	"github.com/gofiber/fiber/v2"
)

func SetRoutes(app *fiber.App, controller controller.Controller, middleware middleware.Middleware) {
	files := app.Group("/files").Use(middleware.AuthenticateLoggedInUserMiddleware)
	{
		files.Get("/", controller.GetFiles)
		files.Post("/", controller.RegistrationFile)
	}

	users := app.Group("/users")
	{
		users.Post("/login", controller.Login)
		users.Post("/registration", controller.Registration)
		users.Use(middleware.AuthenticateLoggedInUserMiddleware).Post("/logout", controller.Logout)
	}
}
