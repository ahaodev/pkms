package controller

import (
	"net/http"
	"pkms/bootstrap"
	"pkms/domain"

	"github.com/gin-gonic/gin"
)

type TenantUserController struct {
	TenantUsecase domain.TenantUseCase
	Env           *bootstrap.Env
}

// GetTenantUsersWithRoles 获取租户用户及其角色信息（从Casbin中获取角色）
func (tuc *TenantUserController) GetTenantUsersWithRoles(c *gin.Context) {
	tenantID := c.Param("id")

	// 获取租户中的所有用户
	users, err := tuc.TenantUsecase.GetTenantUsers(c, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	// TODO: 从Casbin中获取每个用户在该租户的角色
	// 这里暂时返回用户列表，角色信息需要通过Casbin API获取
	c.JSON(http.StatusOK, domain.RespSuccess(users))
}

// SetUserTenantRole 设置用户在租户中的角色（通过Casbin）
func (tuc *TenantUserController) SetUserTenantRole(c *gin.Context) {
	tenantID := c.Param("id")
	var request struct {
		UserID string `json:"user_id" binding:"required"`
		Role   string `json:"role" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	// 验证角色是否有效
	validRoles := []string{domain.RoleAdmin, domain.TenantRoleOwner, domain.TenantRoleUser, domain.TenantRoleViewer}
	validRole := false
	for _, vr := range validRoles {
		if request.Role == vr {
			validRole = true
			break
		}
	}
	if !validRole {
		c.JSON(http.StatusBadRequest, domain.RespError("无效的角色"))
		return
	}

	// TODO: 通过Casbin设置用户在租户中的角色
	// casbin.AddRoleForUserInDomain(request.UserID, request.Role, tenantID)

	response := map[string]interface{}{
		"user_id":   request.UserID,
		"tenant_id": tenantID,
		"role":      request.Role,
		"message":   "用户租户角色设置成功",
	}
	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetUserTenantRole 获取用户在特定租户中的角色
func (tuc *TenantUserController) GetUserTenantRole(c *gin.Context) {
	tenantID := c.Param("id")
	userID := c.Param("userId")

	// TODO: 从Casbin中获取用户在租户中的角色
	// roles := casbin.GetRolesForUserInDomain(userID, tenantID)

	response := map[string]interface{}{
		"user_id":   userID,
		"tenant_id": tenantID,
		"roles":     []string{}, // TODO: 从Casbin获取
	}
	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// RemoveUserTenantRole 移除用户在租户中的角色
func (tuc *TenantUserController) RemoveUserTenantRole(c *gin.Context) {
	tenantID := c.Param("id")
	userID := c.Param("userId")

	var request struct {
		Role string `json:"role" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	// TODO: 通过Casbin移除用户在租户中的角色
	// casbin.DeleteRoleForUserInDomain(userID, request.Role, tenantID)

	response := map[string]interface{}{
		"user_id":   userID,
		"tenant_id": tenantID,
		"role":      request.Role,
		"message":   "用户租户角色移除成功",
	}
	c.JSON(http.StatusOK, domain.RespSuccess(response))
}
