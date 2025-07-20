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
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 10
	}

	activities, err := dc.DashboardUsecase.GetRecentActivities(c, tenantID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(activities))
}

// GetPackageChartData 获取包统计图表数据
func (dc *DashboardController) GetPackageChartData(c *gin.Context) {

	// 这里需要实现包统计图表数据的逻辑
	chartData := []map[string]interface{}{
		{"name": "Android", "value": 15},
		{"name": "Web", "value": 8},
		{"name": "Desktop", "value": 5},
		{"name": "Linux", "value": 3},
		{"name": "Other", "value": 2},
	}
	c.JSON(http.StatusOK, domain.RespSuccess(chartData))
}

// GetUserChartData 获取用户统计图表数据
func (dc *DashboardController) GetUserChartData(c *gin.Context) {
	// 这里需要实现用户统计图表数据的逻辑
	chartData := []map[string]interface{}{
		{"date": "2024-01", "users": 10},
		{"date": "2024-02", "users": 15},
		{"date": "2024-03", "users": 18},
		{"date": "2024-04", "users": 22},
		{"date": "2024-05", "users": 25},
		{"date": "2024-06", "users": 28},
	}
	c.JSON(http.StatusOK, domain.RespSuccess(chartData))
}

// GetDownloadChartData 获取下载统计图表数据
func (dc *DashboardController) GetDownloadChartData(c *gin.Context) {
	// 这里需要实现下载统计图表数据的逻辑
	chartData := []map[string]interface{}{
		{"date": "2024-07-01", "downloads": 50},
		{"date": "2024-07-02", "downloads": 65},
		{"date": "2024-07-03", "downloads": 45},
		{"date": "2024-07-04", "downloads": 78},
		{"date": "2024-07-05", "downloads": 82},
		{"date": "2024-07-06", "downloads": 91},
		{"date": "2024-07-07", "downloads": 105},
	}
	c.JSON(http.StatusOK, domain.RespSuccess(chartData))
}
