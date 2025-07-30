package controller

import (
	"net/http"
	"pkms/internal/constants"
	"strconv"

	"pkms/bootstrap"
	"pkms/domain"

	"github.com/gin-gonic/gin"
)

type DashboardController struct {
	DashboardUsecase domain.DashboardUsecase
	Env              *bootstrap.Env
}

// GetStats 获取统计信息
func (dc *DashboardController) GetStats(c *gin.Context) {
	tenantID := c.GetHeader(constants.TenantID)
	stats, err := dc.DashboardUsecase.GetStats(c, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(stats))
}

// GetRecentActivities 获取最近活动
func (dc *DashboardController) GetRecentActivities(c *gin.Context) {
	tenantID := c.GetHeader(constants.TenantID)
	userID := c.GetString(constants.UserID)
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 10
	}

	activities, err := dc.DashboardUsecase.GetRecentActivities(c, tenantID, userID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(activities))
}
