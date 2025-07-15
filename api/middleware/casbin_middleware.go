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

		// 检查权限
		hasPermission, err := m.casbinManager.CheckPermission(userID, object, action)
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

		// 检查是否有任一权限
		hasAnyPermission := false
		for _, permission := range permissions {
			if len(permission) >= 2 {
				object := permission[0]
				action := permission[1]

				hasPermission, err := m.casbinManager.CheckPermission(userID, object, action)
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

		// 获取用户角色
		userRoles := m.casbinManager.GetRolesForUser(userID)

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

		// 获取用户角色
		userRoles := m.casbinManager.GetRolesForUser(userID)

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
func (m *CasbinMiddleware) GetUserPermissions(userID string) ([][]string, []string) {
	permissions := m.casbinManager.GetPermissionsForUser(userID)
	roles := m.casbinManager.GetRolesForUser(userID)
	return permissions, roles
}

// HasPermission 检查用户是否有特定权限的辅助函数
func (m *CasbinMiddleware) HasPermission(userID, object, action string) bool {
	hasPermission, err := m.casbinManager.CheckPermission(userID, object, action)
	if err != nil {
		return false
	}
	return hasPermission
}

// RequireProjectPermission 要求项目权限的中间件
func (m *CasbinMiddleware) RequireProjectPermission(action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取用户ID
		userID, exists := c.Get(constants.UserID)
		if !exists {
			c.JSON(http.StatusUnauthorized, domain.RespError("用户未认证"))
			c.Abort()
			return
		}

		userIDStr, ok := userID.(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, domain.RespError("用户ID格式错误"))
			c.Abort()
			return
		}

		// 获取项目ID（可选）
		projectID := c.Param("project_id")
		if projectID == "" {
			projectID = c.Query("project_id")
		}

		// 检查项目权限
		hasPermission, err := m.casbinManager.CheckPermission(userIDStr, "project", action)
		if err != nil {
			c.JSON(http.StatusInternalServerError, domain.RespError("权限检查失败: "+err.Error()))
			c.Abort()
			return
		}

		if !hasPermission {
			c.JSON(http.StatusForbidden, domain.RespError("项目权限不足"))
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequirePackagePermission 要求包权限的中间件
func (m *CasbinMiddleware) RequirePackagePermission(action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取用户ID
		userID, exists := c.Get(constants.UserID)
		if !exists {
			c.JSON(http.StatusUnauthorized, domain.RespError("用户未认证"))
			c.Abort()
			return
		}

		userIDStr, ok := userID.(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, domain.RespError("用户ID格式错误"))
			c.Abort()
			return
		}

		// 获取包名（可选）
		packageName := c.Param("package_name")
		if packageName == "" {
			packageName = c.Query("package_name")
		}

		// 检查包权限
		hasPermission, err := m.casbinManager.CheckPermission(userIDStr, "package", action)
		if err != nil {
			c.JSON(http.StatusInternalServerError, domain.RespError("权限检查失败: "+err.Error()))
			c.Abort()
			return
		}

		if !hasPermission {
			c.JSON(http.StatusForbidden, domain.RespError("包权限不足"))
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireSidebarPermission 要求侧边栏权限的中间件
func (m *CasbinMiddleware) RequireSidebarPermission(item string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取用户ID
		userID, exists := c.Get(constants.UserID)
		if !exists {
			c.JSON(http.StatusUnauthorized, domain.RespError("用户未认证"))
			c.Abort()
			return
		}

		userIDStr, ok := userID.(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, domain.RespError("用户ID格式错误"))
			c.Abort()
			return
		}

		// 检查侧边栏权限
		hasPermission, err := m.casbinManager.CheckPermission(userIDStr, "sidebar", item)
		if err != nil {
			c.JSON(http.StatusInternalServerError, domain.RespError("权限检查失败: "+err.Error()))
			c.Abort()
			return
		}

		if !hasPermission {
			c.JSON(http.StatusForbidden, domain.RespError("侧边栏权限不足"))
			c.Abort()
			return
		}

		c.Next()
	}
}
