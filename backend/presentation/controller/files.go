package controller

import (
	"github.com/YahiroRyo/yappi_storage/backend/presentation/request"
	"github.com/gofiber/fiber/v2"
)

func (controller *Controller) GetFiles(ctx *fiber.Ctx) error {
	req := request.GetFilesRequest{}

	if err := ctx.BodyParser(&req); err != nil {
		return err
	}

	if req.Query == nil {

	}

	return nil
}
