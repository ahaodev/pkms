package middleware

import (
	"net/http"
	"pkms/internal/constants"
	"strings"

	"github.com/gin-gonic/gin"
	"pkms/domain"
	"pkms/internal/tokenutil"
)

func JwtAuthMiddleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.Request.Header.Get("Authorization")
		t := strings.Split(authHeader, " ")
		if len(t) == 2 {
			authToken := t[1]
			authorized, err := tokenutil.IsAuthorized(authToken, secret)
			if authorized {
				userID, err := tokenutil.ExtractIDRoleFromToken(authToken, secret)
				if err != nil {
					c.JSON(http.StatusUnauthorized, domain.RespError(err.Error()))
					c.Abort()
					return
				}

				// 设置用户ID
				c.Set(constants.UserID, userID)

				// 从请求头中获取租户ID
				tenantID := c.Request.Header.Get("x-tenant-id")
				if tenantID != "" {
					c.Set(constants.TenantID, tenantID)
				}

				c.Next()
				return
			}
			c.JSON(http.StatusUnauthorized, domain.RespError(err.Error()))
			c.Abort()
			return
		}
		c.JSON(http.StatusUnauthorized, domain.RespError("Not authorized"))
		c.Abort()
	}
}
