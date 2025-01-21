package route

import (
	"github.com/YahiroRyo/yappi_storage/backend/presentation/api"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/controller"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/middleware"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/ws"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

func SetRoutes(app *fiber.App, controller controller.Controller, api api.Api, wsController ws.WsController, middleware middleware.Middleware) {
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
		files.Get("/file/:file_id", controller.GetFile)
	}

	users := app.Group("/users")
	{
		users.Get("", controller.GetLoggedInUser)
		users.Post("/login", controller.Login)
		users.Post("/registration", controller.Registration)
		users.Use(middleware.AuthenticateLoggedInUserMiddleware).Post("/logout", controller.Logout)
		users.Use(middleware.AuthenticateLoggedInUserMiddleware).Post("/generate/token", controller.GenerateToken)
	}

	ws := app.Group("/ws")
	ws.Use(middleware.AuthenticateLoggedInUserMiddleware).Get("/ws/uploadfile", websocket.New(wsController.UploadFile))

	v1 := app.Group("/v1").Use(middleware.AuthenticateLoggedInUserMiddlewareByToken)
	{
		v1.Post("/files", api.RegistrationFile)
		v1.Get("/ws/uploadfile", websocket.New(wsController.UploadFile))
	}
}
