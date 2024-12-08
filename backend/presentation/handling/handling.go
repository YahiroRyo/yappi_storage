package handling

import (
	"errors"

	"github.com/YahiroRyo/yappi_storage/backend/helper/validate"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/response"
	"github.com/gofiber/fiber/v2"
)

var ErrorHandler = func(ctx *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError

	ctx.Set(fiber.HeaderContentType, fiber.MIMETextPlainCharsetUTF8)

	var validationErr *validate.ValidationError
	if errors.As(err, &validationErr) {
		// errorの配列を想定しているため、errを渡しました
		return response.ValidationErrorResponse(ctx, err)
	}

	var notFoundErr *repository.NotFoundError
	if errors.As(err, &notFoundErr) {
		return ctx.Status(notFoundErr.Code).JSON(response.ErrorResponse{Message: notFoundErr.Message})
	}

	var fieldSqlErr *repository.FieldSQLError
	if errors.As(err, &fieldSqlErr) {
		return ctx.Status(fieldSqlErr.Code).JSON(response.ErrorResponse{Message: fieldSqlErr.Message})
	}

	var fieldFetchAPIError *repository.FieldFetchAPIError
	if errors.As(err, &fieldFetchAPIError) {
		return ctx.Status(fieldFetchAPIError.Code).JSON(response.ErrorResponse{Message: fieldFetchAPIError.Message})
	}

	return ctx.Status(code).JSON(struct {
		Message string `json:"message"`
	}{
		Message: "不明なエラーが発生しました。",
	})
}
