package response

import (
	"strings"

	"github.com/gofiber/fiber/v2"
)

type validationErrorResponse struct {
	Errors []string `json:"errors"`
}

func ValidationErrorResponse(ctx *fiber.Ctx, wrapedErr error) error {
	errMessages := strings.Split(wrapedErr.Error(), "\n")

	return ctx.Status(fiber.StatusBadRequest).JSON(validationErrorResponse{
		Errors: errMessages,
	})
}

type ErrorResponse struct {
	Message string `json:"message"`
}
