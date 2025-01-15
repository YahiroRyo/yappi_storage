package route

import (
	"github.com/YahiroRyo/yappi_storage/backend/presentation/controller"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/middleware"
	"github.com/gofiber/fiber/v2"
)

func SetRoutes(app *fiber.App, controller controller.Controller, middleware middleware.Middleware) {
	app.Get("/", func(ctx *fiber.Ctx) error {
		return ctx.Send(([]byte)("hello"))
	})

	files := app.Group("/files").Use(middleware.AuthenticateLoggedInUserMiddleware)
	{
		files.Get("/", controller.GetFiles)
		files.Post("/", controller.RegistrationFile)
		files.Post("/directory", controller.RegistrationDirectory)
		files.Put("/move", controller.MoveFile)
		files.Put("/rename", controller.RenameFile)
		files.Delete("/", controller.DeleteFile)
	}

	users := app.Group("/users")
	{
		users.Get("", controller.GetLoggedInUser)
		users.Post("/login", controller.Login)
		users.Post("/registration", controller.Registration)
		users.Use(middleware.AuthenticateLoggedInUserMiddleware).Post("/logout", controller.Logout)
	}
}
