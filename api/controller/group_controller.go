package controller

import (
	"pkms/bootstrap"
	"pkms/domain"
)

type GroupController struct {
	GroupUsecase domain.GroupUsecase
	Env          *bootstrap.Env
}
