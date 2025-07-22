package controller

import (
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

// AddPolicy 添加权限策略
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

// RemovePolicy 移除权限策略
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

// AddRole 为用户添加角色
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

// RemoveRole 移除用户角色
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

// CheckPermission 检查权限
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

// GetUserPermissions 获取用户权限
func (cc *CasbinController) GetUserPermissions(c *gin.Context) {
	userID := c.GetString(constants.UserID)
	tenantID := c.GetString(constants.TenantID)
	permissions := cc.casbinManager.GetPermissionsForUser(userID, tenantID)
	roles := cc.casbinManager.GetRolesForUser(userID, tenantID)

	response := domain.UserPermissionsResponse{
		UserID:      userID,
		Permissions: permissions,
		Roles:       roles,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetUserRoles 获取用户角色
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

// GetRoleUsers 获取角色下的用户
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

// GetAllPolicies 获取所有策略
func (cc *CasbinController) GetAllPolicies(c *gin.Context) {
	policies := cc.casbinManager.GetAllPolicies()

	response := gin.H{
		"policies": policies,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetAllRoles 获取所有角色
func (cc *CasbinController) GetAllRoles(c *gin.Context) {
	roles := cc.casbinManager.GetAllRoles()

	response := gin.H{
		"roles": roles,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetAllRoleNames 获取所有角色名称
func (cc *CasbinController) GetAllRoleNames(c *gin.Context) {
	roleNames := cc.casbinManager.GetAllRoleNames()

	response := gin.H{
		"role_names": roleNames,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetAllObjects 获取所有对象名称
func (cc *CasbinController) GetAllObjects(c *gin.Context) {
	objects := cc.casbinManager.GetAllObjects()

	response := gin.H{
		"objects": objects,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetAllActions 获取所有操作名称
func (cc *CasbinController) GetAllActions(c *gin.Context) {
	actions := cc.casbinManager.GetAllActions()

	response := gin.H{
		"actions": actions,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// AddRolePolicy 为角色添加权限策略
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

// RemoveRolePolicy 移除角色权限策略
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

// GetRolePermissions 获取角色权限
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

// GetSidebarPermissions 获取侧边栏权限
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

// GetProjectPermissions 获取项目权限
func (cc *CasbinController) GetProjectPermissions(c *gin.Context) {
	// 获取当前用户ID
	userID := c.GetString(constants.UserID)
	tenantID := c.GetString("tenant_id")
	// 获取项目ID（可选）
	projectID := c.Query("project_id")

	// 获取项目权限
	projectPermissions := cc.casbinManager.GetProjectPermissions(userID, tenantID, projectID)

	response := gin.H{
		"user_id":     userID,
		"project_id":  projectID,
		"permissions": projectPermissions,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetPackagePermissions 获取包权限
func (cc *CasbinController) GetPackagePermissions(c *gin.Context) {
	// 获取当前用户ID
	userID := c.GetString(constants.UserID)
	tenantID := c.GetString(constants.TenantID)

	// 获取包名（可选）
	packageName := c.Query("package_name")

	// 获取包权限
	packagePermissions := cc.casbinManager.GetPackagePermissions(userID, tenantID, packageName)

	response := gin.H{
		"user_id":      userID,
		"package_name": packageName,
		"permissions":  packagePermissions,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// ReloadPolicies 重新加载策略
func (cc *CasbinController) ReloadPolicies(c *gin.Context) {
	err := cc.casbinManager.LoadPolicy()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("重新加载策略失败: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("策略重新加载成功"))
}

// ClearAllPolicies 清空所有策略
func (cc *CasbinController) ClearAllPolicies(c *gin.Context) {
	// 检查是否是管理员
	userID := c.GetString(constants.UserID)
	tenantID := c.GetString(constants.TenantID)

	// 检查是否有管理员权限
	hasPermission, err := cc.casbinManager.CheckPermission(userID, tenantID, "system", "manage")
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("权限检查失败: "+err.Error()))
		return
	}

	if !hasPermission {
		c.JSON(http.StatusForbidden, domain.RespError("权限不足，需要管理员权限"))
		return
	}

	// 清空所有策略
	err = cc.casbinManager.ClearAllPolicies()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("清空策略失败: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("策略清空成功"))
}

// ClearAllRoles 清空所有角色
func (cc *CasbinController) ClearAllRoles(c *gin.Context) {
	// 检查是否是管理员
	userID := c.GetString(constants.UserID)
	tenantID := c.GetString(constants.TenantID)

	// 检查是否有管理员权限
	hasPermission, err := cc.casbinManager.CheckPermission(userID, tenantID, "system", "manage")
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("权限检查失败: "+err.Error()))
		return
	}

	if !hasPermission {
		c.JSON(http.StatusForbidden, domain.RespError("权限不足，需要管理员权限"))
		return
	}

	// 清空所有角色
	err = cc.casbinManager.ClearAllRoles()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("清空角色失败: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("角色清空成功"))
}

// GetEnhancedPolicies 获取增强版策略列表（包含可读名称）
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

// GetEnhancedRoles 获取增强版角色列表（包含可读名称）
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

// GetAllTenants 获取所有租户列表（用于下拉选择）
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

// GetAllUsers 获取所有用户列表（用于下拉选择）
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
