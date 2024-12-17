package controller

import "github.com/YahiroRyo/yappi_storage/backend/service"

type Controller struct {
	GetFilesService         service.GetFilesService
	GetFileService          service.GetFileService
	SearchFilesService      service.SearchFilesService
	RegistrationFileService service.RegistrationFileService
	MoveFileService         service.MoveFileService
	RenameFileService       service.RenameFileService
	DeleteFileService       service.DeleteFileService

	GetLoggedInUserService  service.GetLoggedInUserService
	LoginService            service.LoginService
	RegistrationUserService service.RegistrationUserService
	LogoutService           service.LogoutService
}
