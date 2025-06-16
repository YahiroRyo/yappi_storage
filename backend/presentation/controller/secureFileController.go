package controller

import (
	"os"
	"path/filepath"

	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/service"
	"github.com/gofiber/fiber/v2"
)

type SecureFileController struct {
	GetFileService *service.GetFileService
}

func (controller *SecureFileController) GetSecureFile(c *fiber.Ctx) error {
	// 本番環境でのみ有効
	if os.Getenv("ENVIRONMENT") != "production" {
		return c.Status(404).JSON(fiber.Map{
			"message": "このエンドポイントは本番環境でのみ利用可能です",
		})
	}

	fileID := c.Params("id")
	userContext := c.Locals("user").(user.User)

	// ファイルの所有権確認
	file, err := controller.GetFileService.Execute(userContext, fileID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{
			"message": "ファイルが見つかりません",
		})
	}

	if file == nil {
		return c.Status(404).JSON(fiber.Map{
			"message": "ファイルが見つかりません",
		})
	}

	// ファイルの実際のパス構築（ファイルID + 拡張子）
	ext := filepath.Ext(file.Name)
	filename := fileID + ext

	// ストレージパスを検索してファイルを見つける
	storePaths := []string{"1", "2", "3", "4", "5"}
	var filePath string
	var found bool

	for _, storePath := range storePaths {
		possiblePath := filepath.Join("storage/files", storePath, filename)
		if _, err := os.Stat(possiblePath); err == nil {
			filePath = possiblePath
			found = true
			break
		}
	}

	if !found {
		return c.Status(404).JSON(fiber.Map{
			"message": "ファイルが見つかりません",
		})
	}

	// ファイルの送信
	return c.SendFile(filePath)
}
