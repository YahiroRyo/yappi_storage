package service

import "github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"

type GetStoreStoragePathService struct {
	FileRepo repository.FileRepositoryInterface
}

func (s *GetStoreStoragePathService) Execute() (string, error) {
	return s.FileRepo.GetStoreStoragePath()
}
