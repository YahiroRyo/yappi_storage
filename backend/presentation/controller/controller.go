package controller

import "github.com/YahiroRyo/yappi_storage/backend/service"

type Controller struct {
	GetFilesService              service.GetFilesService
	GetFileService               service.GetFileService
	SearchFilesService           service.SearchFilesService
	RegistrationFilesService     service.RegistrationFilesService
	RegistrationDirectoryService service.RegistrationDirectoryService
	MoveFilesService             service.MoveFilesService
	RenameFileService            service.RenameFileService
	DeleteFilesService           service.DeleteFilesService

	GetLoggedInUserService  service.GetLoggedInUserService
	LoginService            service.LoginService
	RegistrationUserService service.RegistrationUserService
	LogoutService           service.LogoutService
	GenerateTokenService    service.GenerateTokenService
}
