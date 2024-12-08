package controller

import (
	"github.com/YahiroRyo/yappi_storage/backend/presentation/request"
	"github.com/YahiroRyo/yappi_storage/backend/presentation/session"
	"github.com/gofiber/fiber/v2"
)

func (controller *Controller) Login(ctx *fiber.Ctx) error {
	req := request.LoginRequest{}
	if err := ctx.BodyParser(&req); err != nil {
		return err
	}

	sess, err := session.GetSession(ctx)
	if err != nil {
		return err
	}

	user, err := controller.LoginService.Execute(sess, req.Email, req.Password)
	if err != nil {
		return err
	}

	ctx.JSON(user)

	return nil
}

func (controller *Controller) Registration(ctx *fiber.Ctx) error {
	req := request.RegistrationRequest{}
	if err := ctx.BodyParser(&req); err != nil {
		return err
	}

	sess, err := session.GetSession(ctx)
	if err != nil {
		return err
	}

	err = controller.RegistrationUserService.Execute(sess, req.Email, req.Password, req.Icon)
	if err != nil {
		return err
	}

	user, err := controller.LoginService.Execute(sess, req.Email, req.Password)
	if err != nil {
		return err
	}

	ctx.JSON(user)

	return nil
}

func (controller *Controller) Logout(ctx *fiber.Ctx) error {
	sess, err := session.GetSession(ctx)
	if err != nil {
		return err
	}

	err = controller.LogoutService.Execute(sess)
	if err != nil {
		return err
	}

	return nil
}
