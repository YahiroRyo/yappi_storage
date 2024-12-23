package main

import (
	"fmt"
	"log"
	"os"
	"time"

	pb "github.com/YahiroRyo/yappi_storage/backend/grpc"
	"github.com/YahiroRyo/yappi_storage/backend/helper"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/database"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/route"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/controller"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/grpc"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/handling"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/middleware"
	"github.com/YahiroRyo/yappi_storage/backend/service"
	"github.com/goccy/go-json"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"github.com/joho/godotenv"
)

func main() {
	grpcServer := helper.NewGrpcServer()

	userRepo := repository.UserRepository{}
	fileRepo := repository.FileRepository{}
	chatGPTRepo := repository.ChatGPTRepository{}

	app := fiber.New(fiber.Config{
		JSONEncoder:  json.Marshal,
		JSONDecoder:  json.Unmarshal,
		ErrorHandler: handling.ErrorHandler,
	})

	err := godotenv.Load(".env")

	if err != nil {
		panic(err)
	}

	conn, err := database.ConnectToDB()
	if err != nil {
		panic(err)
	}
	defer conn.Close()

	file, err := os.OpenFile(fmt.Sprintf("./storage/logs/%s.log", time.Now().Format("2006-01-02")), os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("error opening file: %v", err)
	}

	app.Use(requestid.New())
	app.Use(logger.New(logger.Config{
		Output:     file,
		Format:     "${time} [${ip}]:${port} ${status} - ${method} ${path} ${error}\n",
		TimeFormat: "2006-01-02 15:04:05",
		TimeZone:   "Asia/Tokyo",
	}))

	defer file.Close()

	pb.RegisterFileServiceServer(&grpcServer.Server, &grpc.GrpcController{
		UploadFileChunkService: service.UploadFileChunkService{
			FileRepo: &fileRepo,
		},
		GetLoggedInUserService: service.GetLoggedInUserService{
			Conn:     conn,
			UserRepo: &userRepo,
		},
	})

	route.SetRoutes(app, controller.Controller{
		GetFilesService: service.GetFilesService{
			Conn:     conn,
			FileRepo: &fileRepo,
		},
		GetFileService: service.GetFileService{
			Conn:     conn,
			FileRepo: &fileRepo,
		},
		SearchFilesService: service.SearchFilesService{
			Conn:        conn,
			FileRepo:    &fileRepo,
			ChatGPTRepo: &chatGPTRepo,
		},
		RegistrationFileService: service.RegistrationFileService{
			Conn:        conn,
			UserRepo:    &userRepo,
			FileRepo:    &fileRepo,
			ChatGPTRepo: &chatGPTRepo,
		},
		RenameFileService: service.RenameFileService{
			Conn:     conn,
			FileRepo: &fileRepo,
		},
		MoveFileService: service.MoveFileService{
			Conn:     conn,
			FileRepo: &fileRepo,
		},
		DeleteFileService: service.DeleteFileService{
			Conn:     conn,
			FileRepo: &fileRepo,
		},

		GetLoggedInUserService: service.GetLoggedInUserService{
			Conn:     conn,
			UserRepo: &userRepo,
		},
		LoginService: service.LoginService{
			Conn:     conn,
			UserRepo: &userRepo,
		},
		RegistrationUserService: service.RegistrationUserService{
			Conn:     conn,
			UserRepo: &userRepo,
		},
		LogoutService: service.LogoutService{
			Conn:     conn,
			UserRepo: &userRepo,
		},
	}, middleware.Middleware{
		GetLoggedInUserService: service.GetLoggedInUserService{
			Conn:     conn,
			UserRepo: &userRepo,
		},
	})

	go grpcServer.Listen(":9000")
	go app.Listen(":8000")

	select {}
}
