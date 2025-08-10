package middleware

import (
	"fmt"
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

// RequireRole 要求特定角色的中间件
func (m *CasbinMiddleware) RequireRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取用户ID
		userID := c.GetString(constants.UserID)
		tenantID := c.GetHeader(constants.TenantID)

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
		tenantID := c.GetHeader(constants.TenantID)

		// 调试：打印权限检查信息
		fmt.Printf("🔍 权限检查 - UserID: %s, TenantID: %s, 需要角色: %v\n", userID, tenantID, roles)

		// 获取用户角色
		userRoles := m.casbinManager.GetRolesForUser(userID, tenantID)
		fmt.Printf("🔍 用户实际角色: %v\n", userRoles)

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

		fmt.Printf("🔍 权限检查结果: %t\n", hasAnyRole)

		if !hasAnyRole {
			c.JSON(http.StatusForbidden, domain.RespError("角色权限不足"))
			c.Abort()
			return
		}

		c.Next()
	}
}
