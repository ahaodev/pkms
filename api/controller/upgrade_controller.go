package controller

import (
	"net/http"
	"strconv"

	"pkms/bootstrap"
	"pkms/domain"
	"pkms/internal/constants"

	"github.com/gin-gonic/gin"
)

type UpgradeController struct {
	UpgradeUsecase domain.UpgradeUsecase
	Env            *bootstrap.Env
}

// CreateUpgradeTarget 创建升级目标
func (uc *UpgradeController) CreateUpgradeTarget(c *gin.Context) {
	userID := c.GetString(constants.UserID)
	tenantID := c.GetHeader(constants.TenantID)

	var request domain.CreateUpgradeTargetRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	target, err := uc.UpgradeUsecase.CreateUpgradeTarget(c, &request, userID, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusCreated, domain.RespSuccess(target))
}

// GetUpgradeTargets 获取升级目标列表
func (uc *UpgradeController) GetUpgradeTargets(c *gin.Context) {
	tenantID := c.GetHeader(constants.TenantID)

	// 构建过滤条件
	filters := make(map[string]interface{})
	if projectID := c.Query("project_id"); projectID != "" {
		filters["project_id"] = projectID
	}
	if packageID := c.Query("package_id"); packageID != "" {
		filters["package_id"] = packageID
	}
	if isActiveStr := c.Query("is_active"); isActiveStr != "" {
		if isActive, err := strconv.ParseBool(isActiveStr); err == nil {
			filters["is_active"] = isActive
		}
	}

	targets, err := uc.UpgradeUsecase.GetUpgradeTargets(c, tenantID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(targets))
}

// GetUpgradeTarget 获取特定升级目标
func (uc *UpgradeController) GetUpgradeTarget(c *gin.Context) {
	id := c.Param("id")

	target, err := uc.UpgradeUsecase.GetUpgradeTargetByID(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("升级目标不存在"))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(target))
}

// UpdateUpgradeTarget 更新升级目标
func (uc *UpgradeController) UpdateUpgradeTarget(c *gin.Context) {
	id := c.Param("id")

	var request domain.UpdateUpgradeTargetRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	if err := uc.UpgradeUsecase.UpdateUpgradeTarget(c, id, &request); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("升级目标更新成功"))
}

// DeleteUpgradeTarget 删除升级目标
func (uc *UpgradeController) DeleteUpgradeTarget(c *gin.Context) {
	id := c.Param("id")

	if err := uc.UpgradeUsecase.DeleteUpgradeTarget(c, id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("升级目标删除成功"))
}

// CheckUpdate 检查更新（供客户端调用）
func (uc *UpgradeController) CheckUpdate(c *gin.Context) {
	var request domain.CheckUpdateRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	response, err := uc.UpgradeUsecase.CheckUpdate(c, &request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetProjectUpgradeTargets 获取项目的所有升级目标
func (uc *UpgradeController) GetProjectUpgradeTargets(c *gin.Context) {
	projectID := c.Param("projectId")

	targets, err := uc.UpgradeUsecase.GetProjectUpgradeTargets(c, projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(targets))
}
