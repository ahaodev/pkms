package controller

import (
	"net/http"
	"pkms/bootstrap"
	"pkms/domain"
	"pkms/internal/constants"
	"strconv"

	"github.com/gin-gonic/gin"
)

// AccessManagerController 管理通过access token 接入该系统的凭证管理
type AccessManagerController struct {
	ClientAccessUsecase domain.ClientAccessUsecase
	UpgradeUsecase      domain.UpgradeUsecase
	Env                 *bootstrap.Env
}

// CreateClientAccess 创建客户端接入凭证（需要管理员权限）
func (cac *AccessManagerController) CreateClientAccess(c *gin.Context) {
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
func (cac *AccessManagerController) GetClientAccessList(c *gin.Context) {
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
func (cac *AccessManagerController) GetClientAccess(c *gin.Context) {
	id := c.Param("id")

	access, err := cac.ClientAccessUsecase.GetByID(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("客户端接入凭证不存在"))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(access))
}

// UpdateClientAccess 更新客户端接入凭证（需要管理员权限）
func (cac *AccessManagerController) UpdateClientAccess(c *gin.Context) {
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
func (cac *AccessManagerController) DeleteClientAccess(c *gin.Context) {
	id := c.Param("id")

	if err := cac.ClientAccessUsecase.Delete(c, id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("客户端接入凭证删除成功"))
}

// RegenerateToken 重新生成访问令牌（需要管理员权限）
func (cac *AccessManagerController) RegenerateToken(c *gin.Context) {
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
