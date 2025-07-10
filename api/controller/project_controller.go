package controller

import (
	"pkms/bootstrap"
	"pkms/domain"
)

type ProjectController struct {
	ProjectUsecase domain.ProjectUsecase
	Env            *bootstrap.Env
}
