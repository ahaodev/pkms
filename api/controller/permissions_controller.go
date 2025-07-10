package controller

import (
	"pkms/bootstrap"
	"pkms/domain"
)

type PermissionsController struct {
	PermissionUsecase domain.PermissionUsecase
	Env               *bootstrap.Env
}
