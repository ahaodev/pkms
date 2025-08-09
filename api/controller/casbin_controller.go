package controller

import (
	"fmt"
	"net/http"
	"pkms/domain"
	"pkms/internal/casbin"
	"pkms/internal/constants"

	"github.com/gin-gonic/gin"
)

// CasbinController 权限管理控制器
type CasbinController struct {
	casbinManager    *casbin.CasbinManager
	userRepository   domain.UserRepository
	tenantRepository domain.TenantRepository
}

// NewCasbinController 创建新的权限管理控制器
func NewCasbinController(casbinManager *casbin.CasbinManager, userRepository domain.UserRepository, tenantRepository domain.TenantRepository) *CasbinController {
	return &CasbinController{
		casbinManager:    casbinManager,
		userRepository:   userRepository,
		tenantRepository: tenantRepository,
	}
}

// AddPolicy godoc
// @Summary      Add permission policy
// @Description  Add a new permission policy to Casbin
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      domain.AddPolicyRequest  true  "Policy to add"
// @Success      200  {object}  domain.Response  "Policy added successfully"
// @Failure      400  {object}  domain.Response  "Invalid request parameters"
// @Failure      409  {object}  domain.Response  "Policy already exists"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/policy [post]
func (cc *CasbinController) AddPolicy(c *gin.Context) {
	var req domain.AddPolicyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("请求参数错误: "+err.Error()))
		return
	}

	added, err := cc.casbinManager.AddPolicy(req.UserID, req.Tenant, req.Object, req.Action)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("添加策略失败: "+err.Error()))
		return
	}

	if !added {
		c.JSON(http.StatusConflict, domain.RespError("策略已存在"))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("策略添加成功"))
}

// RemovePolicy godoc
// @Summary      Remove permission policy
// @Description  Remove an existing permission policy from Casbin
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      domain.RemovePolicyRequest  true  "Policy to remove"
// @Success      200  {object}  domain.Response  "Policy removed successfully"
// @Failure      400  {object}  domain.Response  "Invalid request parameters"
// @Failure      404  {object}  domain.Response  "Policy not found"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/policy [delete]
func (cc *CasbinController) RemovePolicy(c *gin.Context) {
	var req domain.RemovePolicyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("请求参数错误: "+err.Error()))
		return
	}

	removed, err := cc.casbinManager.RemovePolicy(req.UserID, req.Tenant, req.Object, req.Action)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("移除策略失败: "+err.Error()))
		return
	}

	if !removed {
		c.JSON(http.StatusNotFound, domain.RespError("策略不存在"))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("策略移除成功"))
}

// AddRole godoc
// @Summary      Add role to user
// @Description  Add a role to a user in a specific tenant domain
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      domain.AddRoleRequest  true  "Role assignment data"
// @Success      200  {object}  domain.Response  "Role added successfully"
// @Failure      400  {object}  domain.Response  "Invalid request parameters"
// @Failure      409  {object}  domain.Response  "Role already exists"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/role [post]
func (cc *CasbinController) AddRole(c *gin.Context) {
	var req domain.AddRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("请求参数错误: "+err.Error()))
		return
	}

	added, err := cc.casbinManager.AddRoleForUser(req.UserID, req.Tenant, req.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("添加角色失败: "+err.Error()))
		return
	}

	if !added {
		c.JSON(http.StatusConflict, domain.RespError("角色已存在"))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("角色添加成功"))
}

// RemoveRole godoc
// @Summary      Remove role from user
// @Description  Remove a role from a user in a specific tenant domain
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      domain.RemoveRoleRequest  true  "Role removal data"
// @Success      200  {object}  domain.Response  "Role removed successfully"
// @Failure      400  {object}  domain.Response  "Invalid request parameters"
// @Failure      404  {object}  domain.Response  "Role not found"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/role [delete]
func (cc *CasbinController) RemoveRole(c *gin.Context) {
	var req domain.RemoveRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("请求参数错误: "+err.Error()))
		return
	}

	removed, err := cc.casbinManager.DeleteRoleForUser(req.UserID, req.Tenant, req.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("移除角色失败: "+err.Error()))
		return
	}

	if !removed {
		c.JSON(http.StatusNotFound, domain.RespError("角色不存在"))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("角色移除成功"))
}

// CheckPermission godoc
// @Summary      Check user permission
// @Description  Check if a user has specific permission for an object and action in a tenant domain
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      domain.CheckPermissionRequest  true  "Permission check data"
// @Success      200  {object}  domain.Response  "Permission check result"
// @Failure      400  {object}  domain.Response  "Invalid request parameters"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/permission/check [post]
func (cc *CasbinController) CheckPermission(c *gin.Context) {
	var req domain.CheckPermissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("请求参数错误: "+err.Error()))
		return
	}

	hasPermission, err := cc.casbinManager.CheckPermission(req.UserID, req.Tenant, req.Object, req.Action)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("权限检查失败: "+err.Error()))
		return
	}

	response := gin.H{
		"has_permission": hasPermission,
		"user_id":        req.UserID,
		"object":         req.Object,
		"action":         req.Action,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetUserPermissions godoc
// @Summary      Get user permissions
// @Description  Get all permissions and roles for the current authenticated user
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.Response{data=domain.UserPermissionsResponse}  "User permissions and roles"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/user/permissions [get]
func (cc *CasbinController) GetUserPermissions(c *gin.Context) {
	userID := c.GetString(constants.UserID)
	tenantID := c.GetString(constants.TenantID)

	// 添加调试日志
	fmt.Printf("GetUserPermissions - UserID: %s, TenantID: %s\n", userID, tenantID)

	permissions := cc.casbinManager.GetPermissionsForUser(userID, tenantID)
	roles := cc.casbinManager.GetRolesForUser(userID, tenantID)

	fmt.Printf("GetUserPermissions - Permissions: %v, Roles: %v\n", permissions, roles)

	response := domain.UserPermissionsResponse{
		UserID:      userID,
		Permissions: permissions,
		Roles:       roles,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetUserRoles godoc
// @Summary      Get user roles
// @Description  Get all roles for a specific user in a tenant domain
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        user_id    path      string  true  "User ID"
// @Param        tenant_id  path      string  true  "Tenant ID"
// @Success      200  {object}  domain.Response  "User roles"
// @Failure      400  {object}  domain.Response  "Invalid parameters"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/user/{user_id}/tenant/{tenant_id}/roles [get]
func (cc *CasbinController) GetUserRoles(c *gin.Context) {
	userID := c.Param("user_id")
	tenantID := c.Param("tenant_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, domain.RespError("用户ID不能为空"))
		return
	}

	roles := cc.casbinManager.GetRolesForUser(userID, tenantID)

	response := gin.H{
		"user_id": userID,
		"roles":   roles,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetRoleUsers godoc
// @Summary      Get users with role
// @Description  Get all users that have a specific role in a tenant domain
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        role       path      string  true  "Role name"
// @Param        tenant_id  path      string  true  "Tenant ID"
// @Success      200  {object}  domain.Response  "Users with the role"
// @Failure      400  {object}  domain.Response  "Invalid parameters"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/role/{role}/tenant/{tenant_id}/users [get]
func (cc *CasbinController) GetRoleUsers(c *gin.Context) {
	role := c.Param("role")
	tenantId := c.Param("tenant_id")
	if role == "" {
		c.JSON(http.StatusBadRequest, domain.RespError("角色名不能为空"))
		return
	}

	users := cc.casbinManager.GetUsersForRole(role, tenantId)

	response := gin.H{
		"role":  role,
		"users": users,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetAllPolicies godoc
// @Summary      Get all policies
// @Description  Get all permission policies in the system
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.Response  "All policies"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/policies [get]
func (cc *CasbinController) GetAllPolicies(c *gin.Context) {
	policies := cc.casbinManager.GetAllPolicies()

	response := gin.H{
		"policies": policies,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetAllRoles godoc
// @Summary      Get all roles
// @Description  Get all role assignments in the system
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.Response  "All roles"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/roles [get]
func (cc *CasbinController) GetAllRoles(c *gin.Context) {
	roles := cc.casbinManager.GetAllRoles()

	response := gin.H{
		"roles": roles,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetAllRoleNames godoc
// @Summary      Get all role names
// @Description  Get all unique role names in the system
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.Response  "All role names"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/role-names [get]
func (cc *CasbinController) GetAllRoleNames(c *gin.Context) {
	roleNames := cc.casbinManager.GetAllRoleNames()

	response := gin.H{
		"role_names": roleNames,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetAllObjects godoc
// @Summary      Get all objects
// @Description  Get all unique object names used in policies
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.Response  "All object names"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/objects [get]
func (cc *CasbinController) GetAllObjects(c *gin.Context) {
	objects := cc.casbinManager.GetAllObjects()

	response := gin.H{
		"objects": objects,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetAllActions godoc
// @Summary      Get all actions
// @Description  Get all unique action names used in policies
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.Response  "All action names"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/actions [get]
func (cc *CasbinController) GetAllActions(c *gin.Context) {
	actions := cc.casbinManager.GetAllActions()

	response := gin.H{
		"actions": actions,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// AddRolePolicy godoc
// @Summary      Add role policy
// @Description  Add a permission policy to a role in a specific tenant domain
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      domain.AddRolePolicyRequest  true  "Role policy data"
// @Success      200  {object}  domain.Response  "Role policy added successfully"
// @Failure      400  {object}  domain.Response  "Invalid request parameters"
// @Failure      409  {object}  domain.Response  "Role policy already exists"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/role/policy [post]
func (cc *CasbinController) AddRolePolicy(c *gin.Context) {
	var req domain.AddRolePolicyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("请求参数错误: "+err.Error()))
		return
	}

	added, err := cc.casbinManager.AddPolicyForRole(req.Role, req.Tenant, req.Object, req.Action)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("添加角色权限失败: "+err.Error()))
		return
	}

	if !added {
		c.JSON(http.StatusConflict, domain.RespError("角色权限已存在"))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("角色权限添加成功"))
}

// RemoveRolePolicy godoc
// @Summary      Remove role policy
// @Description  Remove a permission policy from a role in a specific tenant domain
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      domain.RemoveRolePolicyRequest  true  "Role policy removal data"
// @Success      200  {object}  domain.Response  "Role policy removed successfully"
// @Failure      400  {object}  domain.Response  "Invalid request parameters"
// @Failure      404  {object}  domain.Response  "Role policy not found"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/role/policy [delete]
func (cc *CasbinController) RemoveRolePolicy(c *gin.Context) {
	var req domain.RemoveRolePolicyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("请求参数错误: "+err.Error()))
		return
	}

	removed, err := cc.casbinManager.RemovePolicyForRole(req.Role, req.Tenant, req.Object, req.Action)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("移除角色权限失败: "+err.Error()))
		return
	}

	if !removed {
		c.JSON(http.StatusNotFound, domain.RespError("角色权限不存在"))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("角色权限移除成功"))
}

// GetRolePermissions godoc
// @Summary      Get role permissions
// @Description  Get all permissions for a specific role in a tenant domain
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        role       path      string  true  "Role name"
// @Param        tenant_id  path      string  true  "Tenant ID"
// @Success      200  {object}  domain.Response{data=domain.RolePermissionsResponse}  "Role permissions"
// @Failure      400  {object}  domain.Response  "Invalid parameters"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/role/{role}/tenant/{tenant_id}/permissions [get]
func (cc *CasbinController) GetRolePermissions(c *gin.Context) {
	role := c.Param("role")
	tenant_id := c.Param("tenant_id")
	if role == "" {
		c.JSON(http.StatusBadRequest, domain.RespError("角色名不能为空"))
		return
	}

	permissions := cc.casbinManager.GetPermissionsForRole(role, tenant_id)

	response := domain.RolePermissionsResponse{
		Role:        role,
		Permissions: permissions,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetSidebarPermissions godoc
// @Summary      Get sidebar permissions
// @Description  Get sidebar navigation permissions for the current authenticated user
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.Response  "Sidebar permissions"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/sidebar/permissions [get]
func (cc *CasbinController) GetSidebarPermissions(c *gin.Context) {
	// 获取当前用户ID
	userID := c.GetString(constants.UserID)
	tenantID := c.GetHeader(constants.TenantID)
	// 获取侧边栏权限
	sidebarPermissions := cc.casbinManager.GetSidebarPermissions(userID, tenantID)

	response := gin.H{
		"sidebar": sidebarPermissions,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetProjectPermissions godoc
// @Summary      Get project permissions
// @Description  Get project-specific permissions for the current authenticated user
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        project_id  query     string  false  "Project ID (optional)"
// @Success      200  {object}  domain.Response  "Project permissions"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/project/permissions [get]
func (cc *CasbinController) GetProjectPermissions(c *gin.Context) {
	// 获取当前用户ID
	userID := c.GetString(constants.UserID)
	tenantID := c.GetString("tenant_id")
	// 获取项目ID（可选）
	projectID := c.Query("project_id")

	// DEMO版本：简化的项目权限检查
	userRoles := cc.casbinManager.GetRolesForUser(userID, tenantID)
	var permissions []string
	for _, role := range userRoles {
		switch role {
		case "admin":
			permissions = []string{"read", "write", "manage"}
		case "manager":
			permissions = []string{"read", "write"}
		default:
			permissions = []string{"read"}
		}
		break
	}

	response := gin.H{
		"user_id":     userID,
		"project_id":  projectID,
		"permissions": permissions,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetPackagePermissions godoc
// @Summary      Get package permissions
// @Description  Get package-specific permissions for the current authenticated user
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        package_name  query     string  false  "Package name (optional)"
// @Success      200  {object}  domain.Response  "Package permissions"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/package/permissions [get]
func (cc *CasbinController) GetPackagePermissions(c *gin.Context) {
	// 获取当前用户ID
	userID := c.GetString(constants.UserID)
	tenantID := c.GetString(constants.TenantID)

	// 获取包名（可选）
	packageName := c.Query("package_name")

	// DEMO版本：简化的包权限检查
	userRoles := cc.casbinManager.GetRolesForUser(userID, tenantID)
	var permissions []string
	for _, role := range userRoles {
		switch role {
		case "admin":
			permissions = []string{"read", "write", "manage"}
		case "manager":
			permissions = []string{"read", "write"}
		default:
			permissions = []string{"read"}
		}
		break
	}

	response := gin.H{
		"user_id":      userID,
		"package_name": packageName,
		"permissions":  permissions,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// ReloadPolicies godoc
// @Summary      Reload policies
// @Description  Reload all policies from the database into memory
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.Response  "Policies reloaded successfully"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/policies/reload [post]
func (cc *CasbinController) ReloadPolicies(c *gin.Context) {
	err := cc.casbinManager.LoadPolicy()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("重新加载策略失败: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("策略重新加载成功"))
}

// GetEnhancedPolicies godoc
// @Summary      Get enhanced policies
// @Description  Get all policies with enhanced information including readable names
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.Response{data=domain.EnhancedPoliciesResponse}  "Enhanced policies with readable names"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/policies/enhanced [get]
func (cc *CasbinController) GetEnhancedPolicies(c *gin.Context) {
	policies := cc.casbinManager.GetAllPolicies()
	var enhancedPolicies []domain.PolicyDetail

	for _, policy := range policies {
		if len(policy) < 4 {
			continue
		}

		policyDetail := domain.PolicyDetail{
			Subject: policy[0],
			Domain:  policy[1],
			Object:  policy[2],
			Action:  policy[3],
		}

		// 尝试获取用户名称
		if user, err := cc.userRepository.GetByID(c.Request.Context(), policyDetail.Subject); err == nil {
			policyDetail.SubjectName = user.Name
		}

		// 尝试获取租户名称
		if tenant, err := cc.tenantRepository.GetByID(c.Request.Context(), policyDetail.Domain); err == nil {
			policyDetail.DomainName = tenant.Name
		}

		enhancedPolicies = append(enhancedPolicies, policyDetail)
	}

	response := domain.EnhancedPoliciesResponse{
		Policies: enhancedPolicies,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetEnhancedRoles godoc
// @Summary      Get enhanced roles
// @Description  Get all roles with enhanced information including readable names
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.Response{data=domain.EnhancedRolesResponse}  "Enhanced roles with readable names"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/roles/enhanced [get]
func (cc *CasbinController) GetEnhancedRoles(c *gin.Context) {
	roles := cc.casbinManager.GetAllRoles()
	var enhancedRoles []domain.RoleDetail

	for _, role := range roles {
		if len(role) < 3 {
			continue
		}

		roleDetail := domain.RoleDetail{
			User:   role[0],
			Role:   role[1],
			Domain: role[2],
		}

		// 尝试获取用户名称
		if user, err := cc.userRepository.GetByID(c.Request.Context(), roleDetail.User); err == nil {
			roleDetail.UserName = user.Name
		}

		// 尝试获取租户名称
		if tenant, err := cc.tenantRepository.GetByID(c.Request.Context(), roleDetail.Domain); err == nil {
			roleDetail.DomainName = tenant.Name
		}

		enhancedRoles = append(enhancedRoles, roleDetail)
	}

	response := domain.EnhancedRolesResponse{
		Roles: enhancedRoles,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetAllTenants godoc
// @Summary      Get all tenants
// @Description  Get all tenants for dropdown selection in UI
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.Response  "All tenants list"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/tenants [get]
func (cc *CasbinController) GetAllTenants(c *gin.Context) {
	tenants, err := cc.tenantRepository.Fetch(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("获取租户列表失败: "+err.Error()))
		return
	}

	var tenantList []gin.H
	for _, tenant := range tenants {
		tenantList = append(tenantList, gin.H{
			"id":   tenant.ID,
			"name": tenant.Name,
		})
	}

	response := gin.H{
		"tenants": tenantList,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetAllUsers godoc
// @Summary      Get all users
// @Description  Get all users for dropdown selection in UI
// @Tags         RBAC
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.Response  "All users list"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /casbin/users [get]
func (cc *CasbinController) GetAllUsers(c *gin.Context) {
	users, err := cc.userRepository.Fetch(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("获取用户列表失败: "+err.Error()))
		return
	}

	var userList []gin.H
	for _, user := range users {
		userList = append(userList, gin.H{
			"id":   user.ID,
			"name": user.Name,
		})
	}

	response := gin.H{
		"users": userList,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}
