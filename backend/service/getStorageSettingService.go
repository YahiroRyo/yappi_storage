package service

import "github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"

type GetStorageSettingService struct {
	FileRepo repository.FileRepositoryInterface
}

func (s *GetStorageSettingService) Execute() ([]string, error) {
	return s.FileRepo.GetStorageSetting()
}
