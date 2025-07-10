package controller

import (
	"pkms/bootstrap"
	"pkms/domain"
)

type PackageController struct {
	PackageUsecase domain.PackageUsecase
	Env            *bootstrap.Env
}
