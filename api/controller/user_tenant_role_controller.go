package controller

import (
	"net/http"
	"pkms/bootstrap"
	"pkms/domain"
	"pkms/internal/constants"

	"github.com/gin-gonic/gin"
)

type UserTenantRoleController struct {
	UserTenantRoleUsecase domain.UserTenantRoleUsecase
	Env                   *bootstrap.Env
}

// AssignUserTenantRoles godoc
// @Summary      Assign roles to user in multiple tenants
// @Description  Assign multiple roles to a user across different tenants (admin only)
// @Tags         User Tenant Roles
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      domain.AssignUserTenantRoleRequest  true  "User tenant role assignment data"
// @Success      200      {object}  domain.Response  "Roles assigned successfully"
// @Failure      400      {object}  domain.Response  "Invalid request data"
// @Failure      500      {object}  domain.Response  "Internal server error"
// @Router       /user-tenant-role/assign [post]
func (utrc *UserTenantRoleController) AssignUserTenantRoles(c *gin.Context) {
	var request domain.AssignUserTenantRoleRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	err := utrc.UserTenantRoleUsecase.AssignUserTenantRoles(c, &request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Roles assigned successfully"))
}

// RemoveUserTenantRole godoc
// @Summary      Remove role from user in tenant
// @Description  Remove a specific role from a user in a specific tenant (admin only)
// @Tags         User Tenant Roles
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      domain.RemoveUserTenantRoleRequest  true  "User tenant role removal data"
// @Success      200      {object}  domain.Response  "Role removed successfully"
// @Failure      400      {object}  domain.Response  "Invalid request data"
// @Failure      500      {object}  domain.Response  "Internal server error"
// @Router       /user-tenant-role/remove [post]
func (utrc *UserTenantRoleController) RemoveUserTenantRole(c *gin.Context) {
	var request domain.RemoveUserTenantRoleRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	err := utrc.UserTenantRoleUsecase.RemoveUserTenantRole(c, &request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Role removed successfully"))
}

// GetUserRolesByTenant godoc
// @Summary      Get user roles in specific tenant
// @Description  Retrieve all roles assigned to a user in a specific tenant
// @Tags         User Tenant Roles
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        userId    path      string  true  "User ID"
// @Param        tenantId  path      string  true  "Tenant ID"
// @Success      200       {object}  domain.Response{data=[]domain.Role}  "User roles retrieved successfully"
// @Failure      404       {object}  domain.Response  "User or tenant not found"
// @Failure      500       {object}  domain.Response  "Internal server error"
// @Router       /user-tenant-role/user/{userId}/tenant/{tenantId}/roles [get]
func (utrc *UserTenantRoleController) GetUserRolesByTenant(c *gin.Context) {
	userID := c.Param("userId")
	tenantID := c.Param("tenantId")

	roles, err := utrc.UserTenantRoleUsecase.GetUserRolesByTenant(c, userID, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(roles))
}

// GetAllUserTenantRoles godoc
// @Summary      Get all user tenant role assignments
// @Description  Retrieve all tenant-role assignments for a specific user
// @Tags         User Tenant Roles
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        userId  path      string  true  "User ID"
// @Success      200     {object}  domain.Response{data=[]domain.UserTenantRole}  "User tenant roles retrieved successfully"
// @Failure      404     {object}  domain.Response  "User not found"
// @Failure      500     {object}  domain.Response  "Internal server error"
// @Router       /user-tenant-role/user/{userId} [get]
func (utrc *UserTenantRoleController) GetAllUserTenantRoles(c *gin.Context) {
	userID := c.Param("userId")

	userTenantRoles, err := utrc.UserTenantRoleUsecase.GetAllUserTenantRoles(c, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(userTenantRoles))
}

// GetCurrentUserTenantRoles godoc
// @Summary      Get current user's tenant role assignments
// @Description  Retrieve all tenant-role assignments for the current authenticated user
// @Tags         User Tenant Roles
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.Response{data=[]domain.UserTenantRole}  "Current user tenant roles retrieved successfully"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /user-tenant-role/current [get]
func (utrc *UserTenantRoleController) GetCurrentUserTenantRoles(c *gin.Context) {
	userID := c.GetString(constants.UserID)

	userTenantRoles, err := utrc.UserTenantRoleUsecase.GetAllUserTenantRoles(c, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(userTenantRoles))
}

// GetUsersByTenantRole godoc
// @Summary      Get users by tenant role
// @Description  Retrieve all users assigned to a specific role in a specific tenant
// @Tags         User Tenant Roles
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        tenantId  path      string  true  "Tenant ID"
// @Param        roleId    path      string  true  "Role ID"
// @Success      200       {object}  domain.Response{data=[]domain.User}  "Users retrieved successfully"
// @Failure      404       {object}  domain.Response  "Tenant or role not found"
// @Failure      500       {object}  domain.Response  "Internal server error"
// @Router       /user-tenant-role/tenant/{tenantId}/role/{roleId}/users [get]
func (utrc *UserTenantRoleController) GetUsersByTenantRole(c *gin.Context) {
	tenantID := c.Param("tenantId")
	roleID := c.Param("roleId")

	users, err := utrc.UserTenantRoleUsecase.GetUsersByTenantRole(c, tenantID, roleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(users))
}
