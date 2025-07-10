package controller

import (
	"pkms/bootstrap"
	"pkms/domain"
)

type UpgradeController struct {
	UpgradeUsecase domain.UpgradeUsecase
	Env            *bootstrap.Env
}
