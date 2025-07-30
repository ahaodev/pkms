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

// GetStats godoc
// @Summary      Get dashboard statistics
// @Description  Retrieve dashboard statistics for the current tenant
// @Tags         Dashboard
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id  header    string  true  "Tenant ID"
// @Success      200  {object}  domain.Response{data=domain.DashboardStats}  "Statistics retrieved successfully"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /dashboard/stats [get]
func (dc *DashboardController) GetStats(c *gin.Context) {
	tenantID := c.GetHeader(constants.TenantID)
	stats, err := dc.DashboardUsecase.GetStats(c, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(stats))
}

// GetRecentActivities godoc
// @Summary      Get recent activities
// @Description  Retrieve recent activities for the current user and tenant
// @Tags         Dashboard
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id  header    string  true   "Tenant ID"
// @Param        limit        query     int     false  "Number of activities to retrieve (default: 10)"
// @Success      200  {object}  domain.Response{data=[]domain.RecentActivity}  "Recent activities retrieved successfully"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /dashboard/activities [get]
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
