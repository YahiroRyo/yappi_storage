package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/database"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/route"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/api"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/controller"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/handling"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/middleware"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/ws"
	"github.com/YahiroRyo/yappi_storage/backend/service"
	"github.com/go-redis/cache/v9"
	"github.com/goccy/go-json"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

func diController(conn *sqlx.DB, userRepo repository.UserRepository, fileRepo repository.FileRepository, chatGPTRepo repository.ChatGPTRepository) controller.Controller {
	return controller.Controller{
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
		RegistrationDirectoryService: service.RegistrationDirectoryService{
			Conn:        conn,
			UserRepo:    &userRepo,
			FileRepo:    &fileRepo,
			ChatGPTRepo: &chatGPTRepo,
		},
		RegistrationFilesService: service.RegistrationFilesService{
			Conn:        conn,
			UserRepo:    &userRepo,
			FileRepo:    &fileRepo,
			ChatGPTRepo: &chatGPTRepo,
		},
		RenameFileService: service.RenameFileService{
			Conn:     conn,
			FileRepo: &fileRepo,
		},
		MoveFilesService: service.MoveFilesService{
			Conn:     conn,
			FileRepo: &fileRepo,
		},
		DeleteFilesService: service.DeleteFilesService{
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
		GenerateTokenService: service.GenerateTokenService{
			Conn:     conn,
			UserRepo: &userRepo,
		},
	}
}

func diApi(conn *sqlx.DB, userRepo repository.UserRepository, fileRepo repository.FileRepository, chatGPTRepo repository.ChatGPTRepository) api.Api {
	return api.Api{
		GetUserByTokenService: service.GetUserByTokenService{
			Conn:     conn,
			UserRepo: &userRepo,
		},
		RegistrationFilesService: service.RegistrationFilesService{
			Conn:        conn,
			UserRepo:    &userRepo,
			FileRepo:    &fileRepo,
			ChatGPTRepo: &chatGPTRepo,
		},
	}
}

func diMiddleware(conn *sqlx.DB, userRepo repository.UserRepository, fileRepo repository.FileRepository, chatGPTRepo repository.ChatGPTRepository) middleware.Middleware {
	return middleware.Middleware{
		GetLoggedInUserService: service.GetLoggedInUserService{
			Conn:     conn,
			UserRepo: &userRepo,
		},
		GetUserByTokenService: service.GetUserByTokenService{
			Conn:     conn,
			UserRepo: &userRepo,
		},
	}
}

func diWs(conn *sqlx.DB, userRepo repository.UserRepository, fileRepo repository.FileRepository, chatGPTRepo repository.ChatGPTRepository) ws.WsController {
	return ws.WsController{
		UploadFileChunkService: service.UploadFileChunkService{
			FileRepo: &fileRepo,
		},
		GetLoggedInUserService: service.GetLoggedInUserService{
			Conn:     conn,
			UserRepo: &userRepo,
		},
		GetStorageSettingService: service.GetStorageSettingService{
			FileRepo: &fileRepo,
		},
		GetStoreStoragePathService: service.GetStoreStoragePathService{
			FileRepo: &fileRepo,
		},
	}
}

func main() {
	redisClient := redis.NewClient(&redis.Options{
		Addr:     "redis:6379",
		Password: "",
		DB:       0,
	})

	userRepo := repository.UserRepository{}
	fileRepo := repository.FileRepository{
		Redis: redisClient,
		Cache: cache.New(&cache.Options{
			Redis: redisClient,
		}),
	}
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

	app.Use(cors.New())
	app.Use(requestid.New())
	app.Use(logger.New(logger.Config{
		Output:     file,
		Format:     "${time} [${ip}]:${port} ${status} - ${method} ${path} ${error}\n",
		TimeFormat: "2006-01-02 15:04:05",
		TimeZone:   "Asia/Tokyo",
	}))

	defer file.Close()

	route.SetRoutes(
		app,
		diController(conn, userRepo, fileRepo, chatGPTRepo),
		diApi(conn, userRepo, fileRepo, chatGPTRepo),
		diWs(conn, userRepo, fileRepo, chatGPTRepo),
		diMiddleware(conn, userRepo, fileRepo, chatGPTRepo),
	)

	app.Static("/files", "./storage/files", fiber.Static{
		Compress:  false,
		Browse:    true,
		ByteRange: true,
	})

	app.Listen(":8000")
}
