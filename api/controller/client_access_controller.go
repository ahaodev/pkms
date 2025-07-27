package controller

import (
	"net/http"
	"strconv"
	"time"

	"pkms/bootstrap"
	"pkms/domain"
	"pkms/internal/constants"

	"github.com/gin-gonic/gin"
)

type ClientAccessController struct {
	ClientAccessUsecase domain.ClientAccessUsecase
	UpgradeUsecase      domain.UpgradeUsecase
	Env                 *bootstrap.Env
}

// CreateClientAccess 创建客户端接入凭证（需要管理员权限）
func (cac *ClientAccessController) CreateClientAccess(c *gin.Context) {
	userID := c.GetString(constants.UserID)
	tenantID := c.GetHeader(constants.TenantID)

	var request domain.CreateClientAccessRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	access, err := cac.ClientAccessUsecase.Create(c, &request, userID, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusCreated, domain.RespSuccess(access))
}

// GetClientAccessList 获取客户端接入凭证列表（需要管理员权限）
func (cac *ClientAccessController) GetClientAccessList(c *gin.Context) {
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

	accessList, err := cac.ClientAccessUsecase.GetList(c, tenantID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(accessList))
}

// GetClientAccess 获取特定客户端接入凭证（需要管理员权限）
func (cac *ClientAccessController) GetClientAccess(c *gin.Context) {
	id := c.Param("id")

	access, err := cac.ClientAccessUsecase.GetByID(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("客户端接入凭证不存在"))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(access))
}

// UpdateClientAccess 更新客户端接入凭证（需要管理员权限）
func (cac *ClientAccessController) UpdateClientAccess(c *gin.Context) {
	id := c.Param("id")

	var request domain.UpdateClientAccessRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	if err := cac.ClientAccessUsecase.Update(c, id, &request); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("客户端接入凭证更新成功"))
}

// DeleteClientAccess 删除客户端接入凭证（需要管理员权限）
func (cac *ClientAccessController) DeleteClientAccess(c *gin.Context) {
	id := c.Param("id")

	if err := cac.ClientAccessUsecase.Delete(c, id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("客户端接入凭证删除成功"))
}

// RegenerateToken 重新生成访问令牌（需要管理员权限）
func (cac *ClientAccessController) RegenerateToken(c *gin.Context) {
	id := c.Param("id")

	newToken, err := cac.ClientAccessUsecase.RegenerateToken(c, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(gin.H{
		"access_token": newToken,
	}))
}

// CheckUpdate 检查更新（客户端调用，无需JWT认证，使用access_token）
func (cac *ClientAccessController) CheckUpdate(c *gin.Context) {
	clientIP := c.ClientIP()

	var request domain.CheckUpdateRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	// 验证 access_token
	clientAccess, err := cac.ClientAccessUsecase.ValidateAccessToken(c, request.AccessToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.RespError("无效的访问令牌"))
		return
	}

	// 检查凭证是否激活
	if !clientAccess.IsActive {
		c.JSON(http.StatusForbidden, domain.RespError("客户端接入凭证已被禁用"))
		return
	}

	// 检查是否过期
	if clientAccess.ExpiresAt != nil && clientAccess.ExpiresAt.Before(time.Now()) {
		c.JSON(http.StatusForbidden, domain.RespError("客户端接入凭证已过期"))
		return
	}

	// 调用升级检查业务逻辑
	response, err := cac.UpgradeUsecase.CheckUpdateByToken(c, &request, clientIP)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}
