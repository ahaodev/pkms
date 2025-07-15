package middleware

import (
	"net/http"
	"pkms/domain"
	"pkms/internal/casbin"
	"pkms/internal/constants"
	"strings"

	"github.com/gin-gonic/gin"
)

// CasbinMiddleware 权限控制中间件
type CasbinMiddleware struct {
	casbinManager *casbin.CasbinManager
}

// NewCasbinMiddleware 创建新的 Casbin 中间件实例
func NewCasbinMiddleware(casbinManager *casbin.CasbinManager) *CasbinMiddleware {
	return &CasbinMiddleware{
		casbinManager: casbinManager,
	}
}

// RequirePermission 要求特定权限的中间件
func (m *CasbinMiddleware) RequirePermission(object, action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取用户ID
		//userID := c.GetString(constants.UserID)
		userRole := c.GetString(constants.UserRole)

		// 获取域（可以从路径参数、查询参数或默认值中获取）
		domainStr := m.extractDomain(c)

		// 检查权限
		hasPermission, err := m.casbinManager.CheckPermission(userRole, domainStr, object, action)
		if err != nil {
			c.JSON(http.StatusInternalServerError, domain.RespError("权限检查失败: "+err.Error()))
			c.Abort()
			return
		}

		if !hasPermission {
			c.JSON(http.StatusForbidden, domain.RespError("权限不足"))
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireAnyPermission 要求任一权限的中间件
func (m *CasbinMiddleware) RequireAnyPermission(permissions [][]string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取用户ID
		userID := c.GetString(constants.UserID)

		// 获取域
		domainStr := m.extractDomain(c)

		// 检查是否有任一权限
		hasAnyPermission := false
		for _, permission := range permissions {
			if len(permission) >= 2 {
				object := permission[0]
				action := permission[1]

				hasPermission, err := m.casbinManager.CheckPermission(userID, domainStr, object, action)
				if err != nil {
					c.JSON(http.StatusInternalServerError, domain.RespError("权限检查失败: "+err.Error()))
					c.Abort()
					return
				}

				if hasPermission {
					hasAnyPermission = true
					break
				}
			}
		}

		if !hasAnyPermission {
			c.JSON(http.StatusForbidden, domain.RespError("权限不足"))
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireRole 要求特定角色的中间件
func (m *CasbinMiddleware) RequireRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取用户ID
		userID := c.GetString(constants.UserID)
		// 获取域
		domainStr := m.extractDomain(c)

		// 获取用户角色
		userRoles := m.casbinManager.GetRolesForUser(userID, domainStr)

		// 检查是否有所需角色
		hasRole := false
		for _, userRole := range userRoles {
			if userRole == role {
				hasRole = true
				break
			}
		}

		if !hasRole {
			c.JSON(http.StatusForbidden, domain.RespError("角色权限不足"))
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireAnyRole 要求任一角色的中间件
func (m *CasbinMiddleware) RequireAnyRole(roles []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取用户ID
		userID := c.GetString(constants.UserID)

		// 获取域
		domainStr := m.extractDomain(c)

		// 获取用户角色
		userRoles := m.casbinManager.GetRolesForUser(userID, domainStr)

		// 检查是否有任一所需角色
		hasAnyRole := false
		for _, requiredRole := range roles {
			for _, userRole := range userRoles {
				if userRole == requiredRole {
					hasAnyRole = true
					break
				}
			}
			if hasAnyRole {
				break
			}
		}

		if !hasAnyRole {
			c.JSON(http.StatusForbidden, domain.RespError("角色权限不足"))
			c.Abort()
			return
		}

		c.Next()
	}
}

// extractDomain 从请求中提取域信息
func (m *CasbinMiddleware) extractDomain(c *gin.Context) string {
	// 优先从路径参数中获取项目ID作为域
	if projectID := c.Param("project_id"); projectID != "" {
		return projectID
	}

	// 从查询参数中获取项目ID
	if projectID := c.Query("project_id"); projectID != "" {
		return projectID
	}

	// 从请求体中获取项目ID（如果是JSON请求）
	if contentType := c.GetHeader("Content-Type"); strings.Contains(contentType, "application/json") {
		if projectID := c.PostForm("project_id"); projectID != "" {
			return projectID
		}
	}

	// 默认使用全局域
	return "*"
}

// GetUserPermissions 获取用户权限信息的辅助函数
func (m *CasbinMiddleware) GetUserPermissions(userID, domain string) ([][]string, []string) {
	permissions := m.casbinManager.GetPermissionsForUser(userID, domain)
	roles := m.casbinManager.GetRolesForUser(userID, domain)
	return permissions, roles
}

// HasPermission 检查用户是否有特定权限的辅助函数
func (m *CasbinMiddleware) HasPermission(userID, domain, object, action string) bool {
	hasPermission, err := m.casbinManager.CheckPermission(userID, domain, object, action)
	if err != nil {
		return false
	}
	return hasPermission
}
