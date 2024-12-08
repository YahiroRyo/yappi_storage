package controller

import "github.com/YahiroRyo/yappi_storage/backend/service"

type Controller struct {
	GetLoggedInUserService  service.GetLoggedInUserService
	GetFilesService         service.GetFilesService
	SearchFilesService      service.SearchFilesService
	LoginService            service.LoginService
	RegistrationUserService service.RegistrationUserService
	LogoutService           service.LogoutService
}
