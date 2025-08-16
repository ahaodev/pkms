package controller

import (
	"net/http"
	"pkms/bootstrap"
	"pkms/domain"
	"pkms/internal/constants"

	"github.com/gin-gonic/gin"
)

type RoleController struct {
	RoleUsecase domain.RoleUsecase
	Env         *bootstrap.Env
}

// GetRoles godoc
// @Summary      Get roles
// @Description  Retrieve all roles for the current tenant
// @Tags         Roles
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id  header    string  true  "Tenant ID"
// @Success      200  {object}  domain.Response{data=[]domain.Role}  "Roles retrieved successfully"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /role [get]
func (rc *RoleController) GetRoles(c *gin.Context) {
	tenantID := c.GetHeader(constants.TenantID)

	roles, err := rc.RoleUsecase.GetRolesByTenant(c, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(roles))
}

// CreateRole godoc
// @Summary      Create a new role
// @Description  Create a new role (admin only)
// @Tags         Roles
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id  header    string                   true  "Tenant ID"
// @Param        request      body      domain.CreateRoleRequest  true  "Role creation data"
// @Success      201  {object}  domain.Response{data=domain.Role}  "Role created successfully"
// @Failure      400  {object}  domain.Response  "Invalid request data"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /role [post]
func (rc *RoleController) CreateRole(c *gin.Context) {
	var request domain.CreateRoleRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	// 验证租户ID
	if request.TenantID == "" {
		c.JSON(http.StatusBadRequest, domain.RespError("tenant_id is required"))
		return
	}

	role, err := rc.RoleUsecase.CreateRole(c, &request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusCreated, domain.RespSuccess(role))
}

// GetRole godoc
// @Summary      Get role by ID
// @Description  Retrieve a specific role by its ID
// @Tags         Roles
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Role ID"
// @Success      200  {object}  domain.Response{data=domain.Role}  "Role retrieved successfully"
// @Failure      404  {object}  domain.Response  "Role not found"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /role/{id} [get]
func (rc *RoleController) GetRole(c *gin.Context) {
	id := c.Param("id")

	role, err := rc.RoleUsecase.GetRoleByID(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("Role not found"))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(role))
}

// UpdateRole godoc
// @Summary      Update role
// @Description  Update an existing role (admin only)
// @Tags         Roles
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      string                   true  "Role ID"
// @Param        request  body      domain.UpdateRoleRequest  true  "Role update data"
// @Success      200      {object}  domain.Response{data=domain.Role}  "Role updated successfully"
// @Failure      400      {object}  domain.Response  "Invalid request data"
// @Failure      404      {object}  domain.Response  "Role not found"
// @Failure      500      {object}  domain.Response  "Internal server error"
// @Router       /role/{id} [put]
func (rc *RoleController) UpdateRole(c *gin.Context) {
	id := c.Param("id")

	var request domain.UpdateRoleRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	role, err := rc.RoleUsecase.UpdateRole(c, id, &request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(role))
}

// DeleteRole godoc
// @Summary      Delete role
// @Description  Delete a role (admin only)
// @Tags         Roles
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Role ID"
// @Success      200  {object}  domain.Response  "Role deleted successfully"
// @Failure      400  {object}  domain.Response  "Cannot delete role"
// @Failure      404  {object}  domain.Response  "Role not found"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /role/{id} [delete]
func (rc *RoleController) DeleteRole(c *gin.Context) {
	id := c.Param("id")

	err := rc.RoleUsecase.DeleteRole(c, id)
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Role deleted successfully"))
}

// AssignRoleToUsers godoc
// @Summary      Assign role to users
// @Description  Assign a role to multiple users (admin only)
// @Tags         Roles
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      string                   true  "Role ID"
// @Param        request  body      domain.AssignRoleRequest  true  "User assignment data"
// @Success      200      {object}  domain.Response  "Role assigned successfully"
// @Failure      400      {object}  domain.Response  "Invalid request data"
// @Failure      404      {object}  domain.Response  "Role not found"
// @Failure      500      {object}  domain.Response  "Internal server error"
// @Router       /role/{id}/assign [post]
func (rc *RoleController) AssignRoleToUsers(c *gin.Context) {
	roleID := c.Param("id")

	var request domain.AssignRoleRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	err := rc.RoleUsecase.AssignRoleToUsers(c, roleID, &request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Role assigned successfully"))
}

// RemoveRoleFromUsers godoc
// @Summary      Remove role from users
// @Description  Remove a role from multiple users (admin only)
// @Tags         Roles
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      string                   true  "Role ID"
// @Param        request  body      domain.AssignRoleRequest  true  "User removal data"
// @Success      200      {object}  domain.Response  "Role removed successfully"
// @Failure      400      {object}  domain.Response  "Invalid request data"
// @Failure      404      {object}  domain.Response  "Role not found"
// @Failure      500      {object}  domain.Response  "Internal server error"
// @Router       /role/{id}/remove [post]
func (rc *RoleController) RemoveRoleFromUsers(c *gin.Context) {
	roleID := c.Param("id")

	var request domain.AssignRoleRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	err := rc.RoleUsecase.RemoveRoleFromUsers(c, roleID, request.UserIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Role removed successfully"))
}

// GetRoleUsers godoc
// @Summary      Get role users
// @Description  Retrieve all users assigned to a specific role
// @Tags         Roles
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Role ID"
// @Success      200  {object}  domain.Response{data=[]domain.User}  "Role users retrieved successfully"
// @Failure      404  {object}  domain.Response  "Role not found"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /role/{id}/users [get]
func (rc *RoleController) GetRoleUsers(c *gin.Context) {
	roleID := c.Param("id")

	users, err := rc.RoleUsecase.GetUsersByRole(c, roleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(users))
}

// GetUserRoles godoc
// @Summary      Get user roles
// @Description  Retrieve all roles assigned to the current user
// @Tags         Roles
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id  header    string  true  "Tenant ID"
// @Success      200  {object}  domain.Response{data=[]domain.Role}  "User roles retrieved successfully"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /role/user [get]
func (rc *RoleController) GetUserRoles(c *gin.Context) {
	userID := c.GetString(constants.UserID)
	tenantID := c.GetHeader(constants.TenantID)

	roles, err := rc.RoleUsecase.GetRolesByUser(c, userID, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(roles))
}

// GetUserRolesByUserID godoc
// @Summary      Get user roles by user ID
// @Description  Retrieve all roles assigned to a specific user (admin only)
// @Tags         Roles
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id  header    string  true  "Tenant ID"
// @Param        userId       path      string  true  "User ID"
// @Success      200  {object}  domain.Response{data=[]domain.Role}  "User roles retrieved successfully"
// @Failure      404  {object}  domain.Response  "User not found"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /role/user/{userId} [get]
func (rc *RoleController) GetUserRolesByUserID(c *gin.Context) {
	userID := c.Param("userId")
	tenantID := c.GetHeader(constants.TenantID)

	roles, err := rc.RoleUsecase.GetRolesByUser(c, userID, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(roles))
}

// AssignMenusToRole godoc
// @Summary      Assign menus to role
// @Description  Assign multiple menus to a role (admin only)
// @Tags         Roles
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      string    true  "Role ID"
// @Param        menuIds  body      []string  true  "Menu IDs to assign"
// @Success      200      {object}  domain.Response  "Menus assigned successfully"
// @Failure      400      {object}  domain.Response  "Invalid request data"
// @Failure      404      {object}  domain.Response  "Role not found"
// @Failure      500      {object}  domain.Response  "Internal server error"
// @Router       /role/{id}/menus [post]
func (rc *RoleController) AssignMenusToRole(c *gin.Context) {
	roleID := c.Param("id")

	var menuIDs []string
	if err := c.ShouldBindJSON(&menuIDs); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	err := rc.RoleUsecase.AssignMenusToRole(c, roleID, menuIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Menus assigned successfully"))
}

// GetRolePermissions godoc
// @Summary      Get role permissions
// @Description  Retrieve all permissions for a specific role
// @Tags         Roles
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Role ID"
// @Success      200  {object}  domain.Response{data=[]domain.RolePermission}  "Role permissions retrieved successfully"
// @Failure      404  {object}  domain.Response  "Role not found"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /role/{id}/permissions [get]
func (rc *RoleController) GetRolePermissions(c *gin.Context) {
	roleID := c.Param("id")

	permissions, err := rc.RoleUsecase.GetRolePermissions(c, roleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(permissions))
}
