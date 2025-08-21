package controller

import (
	"net/http"
	"pkms/bootstrap"
	"pkms/domain"

	"github.com/gin-gonic/gin"
)

type SystemController struct {
	APP *bootstrap.Application
}

// NewSystemController
func NewSystemController(app *bootstrap.Application) *SystemController {
	return &SystemController{
		APP: app,
	}
}

// GetVersion
func (sc *SystemController) GetVersion(c *gin.Context) {
	c.JSON(http.StatusOK, domain.RespSuccess(sc.APP.Version))
}
