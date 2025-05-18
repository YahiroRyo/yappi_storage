package service

import (
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
)

type DeleteCacheService struct {
	FileRepo repository.FileRepositoryInterface
}

func (service *DeleteCacheService) Execute(userID string) error {
	return service.FileRepo.DeleteCache(userID)
}
