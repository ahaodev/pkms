package controller

import (
	"net/http"
	"pkms/bootstrap"
	"pkms/domain"
	"pkms/internal/casbin"
	"pkms/internal/constants"

	"github.com/gin-gonic/gin"
)

type TenantController struct {
	TenantUsecase domain.TenantUseCase
	CasbinManager *casbin.CasbinManager
	Env           *bootstrap.Env
}

// GetTenants 获取所有租户
// @Summary      Get all tenants
// @Description  Retrieve a list of all tenants
// @Tags         Tenants
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object} domain.Response  "Successfully retrieved tenants"
// @Failure      500  {object} domain.Response  "Internal server error"
// @Router       /tenants [get]
func (tc *TenantController) GetTenants(c *gin.Context) {
	tenants, err := tc.TenantUsecase.Fetch(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(tenants))
}

// CreateTenant 创建租户
// @Summary      Create tenant
// @Description  Create a new tenant
// @Tags         Tenants
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        tenant  body     domain.Tenant     true  "Tenant information"
// @Success      201     {object} domain.Response  "Successfully created tenant"
// @Failure      400     {object} domain.Response  "Bad request - invalid parameters"
// @Failure      500     {object} domain.Response  "Internal server error"
// @Router       /tenants [post]
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
// @Summary      Get specific tenant
// @Description  Get a specific tenant by ID
// @Tags         Tenants
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path     string  true  "Tenant ID"
// @Success      200  {object} domain.Response  "Successfully retrieved tenant"
// @Failure      404  {object} domain.Response  "Tenant not found"
// @Router       /tenants/{id} [get]
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
// @Summary      Update tenant
// @Description  Update a specific tenant by ID
// @Tags         Tenants
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id      path     string        true  "Tenant ID"
// @Param        tenant  body     domain.Tenant true  "Updated tenant information"
// @Success      200     {object} domain.Response  "Successfully updated tenant"
// @Failure      400     {object} domain.Response  "Bad request - invalid parameters"
// @Failure      500     {object} domain.Response  "Internal server error"
// @Router       /tenants/{id} [put]
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
// @Summary      Delete tenant
// @Description  Delete a specific tenant by ID
// @Tags         Tenants
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path     string  true  "Tenant ID"
// @Success      200  {object} domain.Response  "Successfully deleted tenant"
// @Failure      500  {object} domain.Response  "Internal server error"
// @Router       /tenants/{id} [delete]
func (tc *TenantController) DeleteTenant(c *gin.Context) {
	id := c.Param("id")

	if err := tc.TenantUsecase.Delete(c, id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Tenant deleted successfully"))
}

// GetTenantUsers 获取租户用户
// @Summary      Get tenant users
// @Description  Get all users belonging to a specific tenant
// @Tags         Tenants
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path     string  true  "Tenant ID"
// @Success      200  {object} domain.Response  "Successfully retrieved tenant users"
// @Failure      500  {object} domain.Response  "Internal server error"
// @Router       /tenants/{id}/users [get]
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
// @Summary      Add user to tenant
// @Description  Add a user to a specific tenant
// @Tags         Tenants
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id      path     string  true  "Tenant ID"
// @Param        request body     object  true  "User ID"
// @Success      200     {object} domain.Response  "Successfully added user to tenant"
// @Failure      400     {object} domain.Response  "Bad request - invalid parameters"
// @Failure      500     {object} domain.Response  "Internal server error"
// @Router       /tenants/{id}/users [post]
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

// GetTenantUsersWithRole 获取租户用户及其角色信息
// @Summary      Get tenant users with roles
// @Description  Get all users in a tenant with their role information
// @Tags         Tenants
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path     string  true  "Tenant ID"
// @Success      200  {object} domain.Response  "Successfully retrieved tenant users with roles"
// @Failure      500  {object} domain.Response  "Internal server error"
// @Router       /tenants/{id}/users/roles [get]
func (tc *TenantController) GetTenantUsersWithRole(c *gin.Context) {
	tenantID := c.Param("id")

	tenantUsers, err := tc.TenantUsecase.GetTenantUsersWithRole(c, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	// 从 Casbin 获取每个用户的实际角色并更新
	for i := range tenantUsers {
		roles := tc.CasbinManager.GetRolesForUserInTenant(tenantUsers[i].UserID, tenantID)
		if len(roles) > 0 {
			tenantUsers[i].Role = roles[0] // 取第一个角色，通常用户在租户中只有一个角色
		} else {
			tenantUsers[i].Role = "user" // 默认角色
		}
	}

	c.JSON(http.StatusOK, domain.RespSuccess(tenantUsers))
}

// AddUserToTenantWithRole 添加用户到租户并设置角色
// @Summary      Add user to tenant with role
// @Description  Add a user to a tenant and assign a specific role
// @Tags         Tenants
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id      path     string                      true  "Tenant ID"
// @Param        request body     domain.TenantUserRequest    true  "User and role information"
// @Success      200     {object} domain.Response            "Successfully added user to tenant with role"
// @Failure      400     {object} domain.Response            "Bad request - invalid parameters"
// @Failure      401     {object} domain.Response            "Unauthorized - user information not found"
// @Failure      500     {object} domain.Response            "Internal server error"
// @Router       /tenants/{id}/users/role [post]
func (tc *TenantController) AddUserToTenantWithRole(c *gin.Context) {
	tenantID := c.Param("id")
	var request domain.TenantUserRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	// 获取当前用户ID作为创建者
	createdBy, exists := c.Get(constants.UserID)
	if !exists {
		c.JSON(http.StatusUnauthorized, domain.RespError("未找到用户信息"))
		return
	}

	if err := tc.TenantUsecase.AddUserToTenantWithRole(c, request.UserID, tenantID, request.Role, createdBy.(string)); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	response := map[string]interface{}{
		"user_id":   request.UserID,
		"tenant_id": tenantID,
		"role":      request.Role,
		"message":   "User added to tenant with role successfully",
	}
	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// UpdateTenantUserRole 更新租户用户角色
// @Summary      Update tenant user role
// @Description  Update the role of a user in a specific tenant
// @Tags         Tenants
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id      path     string                              true  "Tenant ID"
// @Param        userId  path     string                              true  "User ID"
// @Param        request body     domain.UpdateTenantUserRoleRequest  true  "Role update information"
// @Success      200     {object} domain.Response                    "Successfully updated tenant user role"
// @Failure      400     {object} domain.Response                    "Bad request - invalid parameters"
// @Failure      500     {object} domain.Response                    "Internal server error"
// @Router       /tenants/{id}/users/{userId}/role [put]
func (tc *TenantController) UpdateTenantUserRole(c *gin.Context) {
	tenantID := c.Param("id")
	userID := c.Param("userId")
	var request domain.UpdateTenantUserRoleRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	if err := tc.TenantUsecase.UpdateTenantUserRole(c, userID, tenantID, request.Role, request.IsActive); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	response := map[string]interface{}{
		"user_id":   userID,
		"tenant_id": tenantID,
		"role":      request.Role,
		"message":   "Tenant user role updated successfully",
	}
	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetTenantUserRole 获取用户在特定租户中的角色
// @Summary      Get tenant user role
// @Description  Get the role of a specific user in a tenant
// @Tags         Tenants
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id      path     string  true  "Tenant ID"
// @Param        userId  path     string  true  "User ID"
// @Success      200     {object} domain.Response  "Successfully retrieved tenant user role"
// @Failure      404     {object} domain.Response  "User role not found in tenant"
// @Router       /tenants/{id}/users/{userId}/role [get]
func (tc *TenantController) GetTenantUserRole(c *gin.Context) {
	tenantID := c.Param("id")
	userID := c.Param("userId")

	tenantUser, err := tc.TenantUsecase.GetTenantUserRole(c, userID, tenantID)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("未找到用户在该租户中的角色信息"))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(tenantUser))
}

// GetUserTenants 获取用户所属的所有租户及角色信息
// @Summary      Get user tenants
// @Description  Get all tenants that a user belongs to with role information
// @Tags         Tenants
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        userId  path     string  true  "User ID"
// @Success      200     {object} domain.Response  "Successfully retrieved user tenants"
// @Failure      500     {object} domain.Response  "Internal server error"
// @Router       /users/{userId}/tenants [get]
func (tc *TenantController) GetUserTenants(c *gin.Context) {
	userID := c.Param("userId")

	userTenants, err := tc.TenantUsecase.GetUserTenants(c, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(userTenants))
}

// RemoveUserFromTenant 从租户中移除用户
// @Summary      Remove user from tenant
// @Description  Remove a user from a specific tenant
// @Tags         Tenants
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id      path     string  true  "Tenant ID"
// @Param        userId  path     string  true  "User ID"
// @Success      200     {object} domain.Response  "Successfully removed user from tenant"
// @Failure      500     {object} domain.Response  "Internal server error"
// @Router       /tenants/{id}/users/{userId} [delete]
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
