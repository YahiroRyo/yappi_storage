package api

import "github.com/YahiroRyo/yappi_storage/backend/service"

type Api struct {
	GetUserByTokenService   service.GetUserByTokenService
	RegistrationFileService service.RegistrationFileService
}
