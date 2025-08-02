package controller

import (
	"pkms/bootstrap"
	"pkms/domain"
)

type SettingController struct {
	UpgradeUsecase domain.UpgradeUsecase
	Env            *bootstrap.Env
}
