package controller

import (
	"pkms/bootstrap"
	"pkms/domain"
)

type UserController struct {
	UserUsecase domain.UserUseCase
	Env         *bootstrap.Env
}
