package controller

import (
	"pkms/bootstrap"
	"pkms/domain"
)

type DashboardController struct {
	DashboardUsecase domain.DashboardUsecase
	Env              *bootstrap.Env
}
