package api

import (
	"github.com/YahiroRyo/yappi_storage/backend/helper/validate"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/request"
	"github.com/gofiber/fiber/v2"
)

func (api *Api) RegistrationFiles(ctx *fiber.Ctx) error {
	req := request.RegistrationFilesRequest{}

	if err := ctx.BodyParser(&req); err != nil {
		return err
	}

	if err := validate.Validate(req); err != nil {
		return err
	}

	user, err := api.GetUserByTokenService.Execute(ctx.Get("Authorization"))
	if err != nil {
		return err
	}

	files, err := api.RegistrationFilesService.Execute(*user, req)
	if err != nil {
		return err
	}

	return ctx.JSON(files)
}
