package controller

import (
	"net/http"
	"pkms/domain"
	"pkms/internal/casbin"
	"pkms/internal/constants"
	"strconv"

	"github.com/gin-gonic/gin"
)

// CasbinController 权限管理控制器
type CasbinController struct {
	casbinManager *casbin.CasbinManager
}

// NewCasbinController 创建新的权限管理控制器
func NewCasbinController(casbinManager *casbin.CasbinManager) *CasbinController {
	return &CasbinController{
		casbinManager: casbinManager,
	}
}

// AddPolicyRequest 添加策略请求
type AddPolicyRequest struct {
	UserID string `json:"user_id" binding:"required"`
	Domain string `json:"domain" binding:"required"`
	Object string `json:"object" binding:"required"`
	Action string `json:"action" binding:"required"`
}

// RemovePolicyRequest 移除策略请求
type RemovePolicyRequest struct {
	UserID string `json:"user_id" binding:"required"`
	Domain string `json:"domain" binding:"required"`
	Object string `json:"object" binding:"required"`
	Action string `json:"action" binding:"required"`
}

// AddRoleRequest 添加角色请求
type AddRoleRequest struct {
	UserID string `json:"user_id" binding:"required"`
	Role   string `json:"role" binding:"required"`
	Domain string `json:"domain" binding:"required"`
}

// RemoveRoleRequest 移除角色请求
type RemoveRoleRequest struct {
	UserID string `json:"user_id" binding:"required"`
	Role   string `json:"role" binding:"required"`
	Domain string `json:"domain" binding:"required"`
}

// CheckPermissionRequest 检查权限请求
type CheckPermissionRequest struct {
	UserID string `json:"user_id" binding:"required"`
	Domain string `json:"domain" binding:"required"`
	Object string `json:"object" binding:"required"`
	Action string `json:"action" binding:"required"`
}

// UserPermissionsResponse 用户权限响应
type UserPermissionsResponse struct {
	UserID      string     `json:"user_id"`
	Domain      string     `json:"domain"`
	Permissions [][]string `json:"permissions"`
	Roles       []string   `json:"roles"`
}

// AddPolicy 添加权限策略
func (cc *CasbinController) AddPolicy(c *gin.Context) {
	var req AddPolicyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("请求参数错误: "+err.Error()))
		return
	}

	added, err := cc.casbinManager.AddPolicy(req.UserID, req.Domain, req.Object, req.Action)
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
	var req RemovePolicyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("请求参数错误: "+err.Error()))
		return
	}

	removed, err := cc.casbinManager.RemovePolicy(req.UserID, req.Domain, req.Object, req.Action)
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
	var req AddRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("请求参数错误: "+err.Error()))
		return
	}

	added, err := cc.casbinManager.AddRoleForUser(req.UserID, req.Role, req.Domain)
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
	var req RemoveRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("请求参数错误: "+err.Error()))
		return
	}

	removed, err := cc.casbinManager.DeleteRoleForUser(req.UserID, req.Role, req.Domain)
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
	var req CheckPermissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("请求参数错误: "+err.Error()))
		return
	}

	hasPermission, err := cc.casbinManager.CheckPermission(req.UserID, req.Domain, req.Object, req.Action)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("权限检查失败: "+err.Error()))
		return
	}

	response := gin.H{
		"has_permission": hasPermission,
		"user_id":        req.UserID,
		"domain":         req.Domain,
		"object":         req.Object,
		"action":         req.Action,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetUserPermissions 获取用户权限
func (cc *CasbinController) GetUserPermissions(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, domain.RespError("用户ID不能为空"))
		return
	}

	domainParam := c.Query("domain")
	if domainParam == "" {
		domainParam = "*"
	}

	permissions := cc.casbinManager.GetPermissionsForUser(userID, domainParam)
	roles := cc.casbinManager.GetRolesForUser(userID, domainParam)

	response := UserPermissionsResponse{
		UserID:      userID,
		Domain:      domainParam,
		Permissions: permissions,
		Roles:       roles,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetUserRoles 获取用户角色
func (cc *CasbinController) GetUserRoles(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, domain.RespError("用户ID不能为空"))
		return
	}

	domainParam := c.Query("domain")
	if domainParam == "" {
		domainParam = "*"
	}

	roles := cc.casbinManager.GetRolesForUser(userID, domainParam)

	response := gin.H{
		"user_id": userID,
		"domain":  domainParam,
		"roles":   roles,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetRoleUsers 获取角色下的用户
func (cc *CasbinController) GetRoleUsers(c *gin.Context) {
	role := c.Param("role")
	if role == "" {
		c.JSON(http.StatusBadRequest, domain.RespError("角色不能为空"))
		return
	}

	domainParam := c.Query("domain")
	if domainParam == "" {
		domainParam = "*"
	}

	users := cc.casbinManager.GetUsersForRole(role, domainParam)

	response := gin.H{
		"role":   role,
		"domain": domainParam,
		"users":  users,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetAllPolicies 获取所有策略
func (cc *CasbinController) GetAllPolicies(c *gin.Context) {
	// 分页参数
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))

	allPolicies := cc.casbinManager.GetAllPolicies()

	// 简单的分页实现
	total := len(allPolicies)
	start := (page - 1) * limit
	end := start + limit

	if start >= total {
		start = total
	}
	if end > total {
		end = total
	}

	policies := allPolicies[start:end]

	response := gin.H{
		"policies": policies,
		"total":    total,
		"page":     page,
		"limit":    limit,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetAllRoles 获取所有角色映射
func (cc *CasbinController) GetAllRoles(c *gin.Context) {
	// 分页参数
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))

	allRoles := cc.casbinManager.GetAllRoles()

	// 简单的分页实现
	total := len(allRoles)
	start := (page - 1) * limit
	end := start + limit

	if start >= total {
		start = total
	}
	if end > total {
		end = total
	}

	roles := allRoles[start:end]

	response := gin.H{
		"roles": roles,
		"total": total,
		"page":  page,
		"limit": limit,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// InitializePolicies 初始化默认策略
func (cc *CasbinController) InitializePolicies(c *gin.Context) {
	// 检查是否是管理员
	userID, exists := c.Get(constants.UserID)
	if !exists {
		c.JSON(http.StatusUnauthorized, domain.RespError("用户未认证"))
		return
	}

	userIDStr := userID.(string)

	// 检查是否有管理员权限
	hasPermission, err := cc.casbinManager.CheckPermission(userIDStr, "*", "system", "admin")
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("权限检查失败: "+err.Error()))
		return
	}

	if !hasPermission {
		c.JSON(http.StatusForbidden, domain.RespError("权限不足，需要管理员权限"))
		return
	}

	// 初始化默认策略
	err = cc.casbinManager.InitializeDefaultPolicies()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("初始化策略失败: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("策略初始化成功"))
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
