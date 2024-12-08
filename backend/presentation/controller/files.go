package controller

import (
	"github.com/YahiroRyo/yappi_storage/backend/helper/validate"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/request"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/response"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/session"
	"github.com/gofiber/fiber/v2"
)

func (controller *Controller) GetFiles(ctx *fiber.Ctx) error {
	req := request.GetFilesRequest{}

	if err := ctx.BodyParser(&req); err != nil {
		return err
	}

	if err := validate.Validate(req); err != nil {
		return err
	}

	sess, err := session.GetSession(ctx)
	if err != nil {
		return err
	}

	user, err := controller.GetLoggedInUserService.Execute(sess)
	if err != nil {
		return err
	}

	if req.Query == nil {
		files, err := controller.GetFilesService.Execute(*user, req.ParentDirectoryId, req.CurrentPageCount, req.PageSize)
		if err != nil {
			return err
		}

		ctx.JSON(response.GetFilesResponse{
			PageSize:         req.PageSize,
			CurrentPageCount: req.CurrentPageCount,
			Files:            *files,
		})

		return nil
	}

	files, err := controller.SearchFilesService.Execute(*user, *req.Query, req.CurrentPageCount, req.PageSize)
	if err != nil {
		return err
	}

	ctx.JSON(response.GetFilesResponse{
		PageSize:         req.PageSize,
		CurrentPageCount: req.CurrentPageCount,
		Files:            *files,
	})

	return nil
}
