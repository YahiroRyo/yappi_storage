package response

import "github.com/gofiber/fiber/v2"

type validationErrorResponse struct {
	Errors []error `json:"errors"`
}

func ValidationErrorResponse(ctx *fiber.Ctx, wrapedErr error) error {
	if errs, ok := wrapedErr.(interface{ Unwrap() []error }); ok {
		return ctx.Status(fiber.StatusBadRequest).JSON(validationErrorResponse{
			Errors: errs.Unwrap(),
		})
	}

	return nil
}

type ErrorResponse struct {
	Message string `json:"message"`
}
