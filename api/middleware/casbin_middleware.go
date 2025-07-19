package middleware

import (
	"net/http"
	"pkms/domain"
	"pkms/internal/casbin"
	"pkms/internal/constants"

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
		userID := c.GetString(constants.UserID)
		//userRole := c.GetString(constants.UserRole)
		//tenantID := c.GetString(constants.TenantID)

		// 检查权限
		hasPermission, err := m.casbinManager.CheckPermission(userID, userID, object, action)
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
		tenantID := c.GetString(constants.TenantID)

		// 检查是否有任一权限
		hasAnyPermission := false
		for _, permission := range permissions {
			if len(permission) >= 2 {
				object := permission[0]
				action := permission[1]

				hasPermission, err := m.casbinManager.CheckPermission(userID, tenantID, object, action)
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
		tenantID := c.GetString(constants.TenantID)

		// 获取用户角色
		userRoles := m.casbinManager.GetRolesForUser(userID, tenantID)

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
		tenantID := c.GetString(constants.TenantID)

		// 获取用户角色
		userRoles := m.casbinManager.GetRolesForUser(userID, tenantID)

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

// GetUserPermissions 获取用户权限信息的辅助函数
func (m *CasbinMiddleware) GetUserPermissions(userID, tenantID string) ([][]string, []string) {
	permissions := m.casbinManager.GetPermissionsForUser(userID, tenantID)
	roles := m.casbinManager.GetRolesForUser(userID, tenantID)
	return permissions, roles
}

// HasPermission 检查用户是否有特定权限的辅助函数
func (m *CasbinMiddleware) HasPermission(userID, tenantID, object, action string) bool {
	hasPermission, err := m.casbinManager.CheckPermission(userID, tenantID, object, action)
	if err != nil {
		return false
	}
	return hasPermission
}

// 通用资源权限校验中间件
func (m *CasbinMiddleware) RequireResourcePermission(resourceType, action string, paramKey ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString(constants.UserID)
		tenantID := c.GetString(constants.TenantID)

		// 可选参数（如 project_id、package_name）
		var resourceID string
		if len(paramKey) > 0 {
			resourceID = c.Param(paramKey[0])
			if resourceID == "" {
				resourceID = c.Query(paramKey[0])
			}
		}

		// 权限校验
		hasPermission, err := m.casbinManager.CheckPermission(userID, tenantID, resourceType, action)
		if err != nil {
			c.JSON(http.StatusInternalServerError, domain.RespError("权限检查失败: "+err.Error()))
			c.Abort()
			return
		}
		if !hasPermission {
			c.JSON(http.StatusForbidden, domain.RespError(resourceType+"权限不足"))
			c.Abort()
			return
		}
		c.Next()
	}
}

// 用通用方法替换原有项目权限校验
func (m *CasbinMiddleware) RequireProjectPermission(action string) gin.HandlerFunc {
	return m.RequireResourcePermission("project", action, "project_id")
}

// 用通用方法替换原有包权限校验
func (m *CasbinMiddleware) RequirePackagePermission(action string) gin.HandlerFunc {
	return m.RequireResourcePermission("package", action, "package_name")
}

// 用通用方法替换原有侧边栏权限校验
func (m *CasbinMiddleware) RequireSidebarPermission(item string) gin.HandlerFunc {
	return m.RequireResourcePermission("sidebar", item)
}
