package main

import (
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/database"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/route"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/controller"
	"github.com/YahiroRyo/yappi_storage/backend/service"
	"github.com/goccy/go-json"
	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New(fiber.Config{
		JSONEncoder: json.Marshal,
		JSONDecoder: json.Unmarshal,
	})

	conn, err := database.ConnectToDB()
	if err != nil {
		panic(err)
	}

	route.SetRoutes(app, controller.Controller{
		GetLoggedInUserService: service.GetLoggedInUserService{
			Conn:     *conn,
			UserRepo: &repository.UserRepository{},
		},
		GetFilesService: service.GetFilesService{
			Conn:     *conn,
			FileRepo: &repository.FileRepository{},
		},
	})

	app.Listen(":8000")
}
