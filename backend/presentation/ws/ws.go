package ws

import "github.com/YahiroRyo/yappi_storage/backend/service"

type WsController struct {
	UploadFileChunkService     service.UploadFileChunkService
	GetLoggedInUserService     service.GetLoggedInUserService
	GetStorageSettingService   service.GetStorageSettingService
	GetStoreStoragePathService service.GetStoreStoragePathService
}
