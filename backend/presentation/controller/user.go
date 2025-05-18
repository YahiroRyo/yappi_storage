package controller

import (
	"github.com/cockroachdb/errors"

	"github.com/YahiroRyo/yappi_storage/backend/helper/validate"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/request"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/response"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/session"
	"github.com/gofiber/fiber/v2"
)

func (controller *Controller) Login(ctx *fiber.Ctx) error {
	req := request.LoginRequest{}
	if err := ctx.BodyParser(&req); err != nil {
		return errors.WithStack(err)
	}

	if err := validate.Validate(&req); err != nil {
		return errors.WithStack(err)
	}

	sess, err := session.GetSession(ctx)
	if err != nil {
		return errors.WithStack(err)
	}

	user, err := controller.LoginService.Execute(sess, req.Email, req.Password)
	if err != nil {
		return errors.WithStack(err)
	}

	ctx.JSON(user)

	return nil
}

func (controller *Controller) Registration(ctx *fiber.Ctx) error {
	req := request.RegistrationRequest{}
	if err := ctx.BodyParser(&req); err != nil {
		return errors.WithStack(err)
	}

	if err := validate.Validate(&req); err != nil {
		return errors.WithStack(err)
	}

	sess, err := session.GetSession(ctx)
	if err != nil {
		return errors.WithStack(err)
	}

	err = controller.RegistrationUserService.Execute(sess, req.Email, req.Password, req.Icon)
	if err != nil {
		return errors.WithStack(err)
	}

	user, err := controller.LoginService.Execute(sess, req.Email, req.Password)
	if err != nil {
		return errors.WithStack(err)
	}

	ctx.Status(201).JSON(user)

	return nil
}

func (controller *Controller) GetLoggedInUser(ctx *fiber.Ctx) error {
	sess, err := session.GetSession(ctx)
	if err != nil {
		return errors.WithStack(err)
	}

	user, err := controller.GetLoggedInUserService.Execute(sess)
	if err != nil {
		return errors.WithStack(err)
	}

	return ctx.JSON(user)
}

func (controller *Controller) Logout(ctx *fiber.Ctx) error {
	sess, err := session.GetSession(ctx)
	if err != nil {
		return errors.WithStack(err)
	}

	err = controller.LogoutService.Execute(sess)
	if err != nil {
		return errors.WithStack(err)
	}

	return nil
}

func (controller *Controller) GenerateToken(ctx *fiber.Ctx) error {
	sess, err := session.GetSession(ctx)
	if err != nil {
		return errors.WithStack(err)
	}

	user, err := controller.GetLoggedInUserService.Execute(sess)
	if err != nil {
		return errors.WithStack(err)
	}

	token, err := controller.GenerateTokenService.Execute(*user)
	if err != nil {
		return errors.WithStack(err)
	}

	return ctx.JSON(response.GenerateTokenResponse{
		Token: *token,
	})
}
