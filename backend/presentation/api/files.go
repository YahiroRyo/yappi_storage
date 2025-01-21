package api

import (
	"github.com/YahiroRyo/yappi_storage/backend/domain/file"
	"github.com/YahiroRyo/yappi_storage/backend/helper/validate"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/request"
	"github.com/gofiber/fiber/v2"
)

func (api *Api) RegistrationFile(ctx *fiber.Ctx) error {
	req := request.RegistrationFileRequest{}

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

	file, err := api.RegistrationFileService.Execute(*user, req.Url, file.FileKindFromEnString(req.Kind), req.Name, req.ParentDirectoryId)
	if err != nil {
		return err
	}

	return ctx.JSON(file)
}
