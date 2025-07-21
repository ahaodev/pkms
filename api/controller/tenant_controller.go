package controller

import (
	"net/http"
	"pkms/bootstrap"
	"pkms/domain"

	"github.com/gin-gonic/gin"
)

type TenantController struct {
	TenantUsecase domain.TenantUseCase
	Env           *bootstrap.Env
}

// GetTenants 获取所有租户
func (tc *TenantController) GetTenants(c *gin.Context) {
	tenants, err := tc.TenantUsecase.Fetch(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(tenants))
}

// CreateTenant 创建租户
func (tc *TenantController) CreateTenant(c *gin.Context) {
	var tenant domain.Tenant
	if err := c.ShouldBindJSON(&tenant); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	if err := tc.TenantUsecase.Create(c, &tenant); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusCreated, domain.RespSuccess(tenant))
}

// GetTenant 获取特定租户
func (tc *TenantController) GetTenant(c *gin.Context) {
	id := c.Param("id")
	tenant, err := tc.TenantUsecase.GetByID(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("Tenant not found"))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(tenant))
}

// UpdateTenant 更新租户
func (tc *TenantController) UpdateTenant(c *gin.Context) {
	id := c.Param("id")
	var tenant domain.Tenant
	if err := c.ShouldBindJSON(&tenant); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	tenant.ID = id
	if err := tc.TenantUsecase.Update(c, &tenant); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(tenant))
}

// DeleteTenant 删除租户
func (tc *TenantController) DeleteTenant(c *gin.Context) {
	id := c.Param("id")

	if err := tc.TenantUsecase.Delete(c, id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Tenant deleted successfully"))
}

// GetTenantUsers 获取租户用户
func (tc *TenantController) GetTenantUsers(c *gin.Context) {
	tenantID := c.Param("id")

	users, err := tc.TenantUsecase.GetTenantUsers(c, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(users))
}

// AddUserToTenant 添加用户到租户
func (tc *TenantController) AddUserToTenant(c *gin.Context) {
	tenantID := c.Param("id")
	var request struct {
		UserID string `json:"user_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	if err := tc.TenantUsecase.AddUserToTenant(c, request.UserID, tenantID); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	response := map[string]interface{}{
		"user_id":   request.UserID,
		"tenant_id": tenantID,
		"message":   "User added to tenant successfully",
	}
	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// RemoveUserFromTenant 从租户中移除用户
func (tc *TenantController) RemoveUserFromTenant(c *gin.Context) {
	tenantID := c.Param("id")
	userID := c.Param("userId")

	if err := tc.TenantUsecase.RemoveUserFromTenant(c, userID, tenantID); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	response := map[string]interface{}{
		"user_id":   userID,
		"tenant_id": tenantID,
		"message":   "User removed from tenant successfully",
	}
	c.JSON(http.StatusOK, domain.RespSuccess(response))
}
