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
				userID, err := tokenutil.ExtractIDFromToken(authToken, secret)
				if err != nil {
					c.JSON(http.StatusUnauthorized, domain.RespError(err.Error()))
					c.Abort()
					return
				}

				c.Set(constants.UserID, userID)
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
