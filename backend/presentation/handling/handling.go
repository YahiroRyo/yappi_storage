package handling

import (
	"fmt"

	"github.com/cockroachdb/errors"

	"github.com/YahiroRyo/yappi_storage/backend/helper/validate"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/repository"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/middleware"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/response"
	"github.com/YahiroRyo/yappi_storage/backend/service"
	"github.com/gofiber/fiber/v2"
)

func bignessLogicErrorHandler(ctx *fiber.Ctx, err error) bool {
	var alreadyUsedEmailAddress service.AlreadyUsedEmailAddressError
	if errors.As(err, &alreadyUsedEmailAddress) {
		ctx.Status(alreadyUsedEmailAddress.Code).JSON(response.ErrorResponse{Message: alreadyUsedEmailAddress.Message})
		return true
	}

	var notLoggedInError middleware.NotLoggedInError
	if errors.As(err, &notLoggedInError) {
		ctx.Status(notLoggedInError.Code).JSON(response.ErrorResponse{Message: notLoggedInError.Message})
		return true
	}

	return false
}

func basicErrorHandler(ctx *fiber.Ctx, err error) bool {
	var notFoundErr repository.NotFoundError
	if errors.As(err, &notFoundErr) {
		ctx.Status(notFoundErr.Code).JSON(response.ErrorResponse{Message: notFoundErr.Message})
		return true
	}

	var fieldSqlErr repository.FieldSQLError
	if errors.As(err, &fieldSqlErr) {
		ctx.Status(fieldSqlErr.Code).JSON(response.ErrorResponse{Message: fieldSqlErr.Message})
		return true
	}

	var fieldFetchAPIError repository.FieldFetchAPIError
	if errors.As(err, &fieldFetchAPIError) {
		ctx.Status(fieldFetchAPIError.Code).JSON(response.ErrorResponse{Message: fieldFetchAPIError.Message})
		return true
	}

	return false
}

func ErrorHandler(ctx *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	fmt.Printf("%v", err)

	ctx.Set(fiber.HeaderContentType, fiber.MIMETextPlainCharsetUTF8)

	var validationErr validate.ValidationError

	if errors.As(err, &validationErr) {
		return response.ValidationErrorResponse(ctx, err)
	}

	if isExistsErr := bignessLogicErrorHandler(ctx, err); isExistsErr {
		return nil
	}

	if isExistsErr := basicErrorHandler(ctx, err); isExistsErr {
		return nil
	}

	return ctx.Status(code).JSON(struct {
		Message string `json:"message"`
	}{
		Message: "不明なエラーが発生しました。",
	})
}
