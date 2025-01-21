package middleware

import "github.com/YahiroRyo/yappi_storage/backend/service"

type Middleware struct {
	GetLoggedInUserService service.GetLoggedInUserService
	GetUserByTokenService  service.GetUserByTokenService
}
