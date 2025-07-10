package route

import (
	"pkms/frontend"
	"time"

	"github.com/gin-gonic/gin"
	"pkms/api/middleware"
	"pkms/bootstrap"
	"pkms/ent"
)

var APIv1 *gin.RouterGroup

func Setup(env *bootstrap.Env, timeout time.Duration, db *ent.Client, gin *gin.Engine) {
	publicRouter := gin.Group("/api/v1")
	// All Public APIs
	NewLoginRouter(env, timeout, db, publicRouter)
	NewRefreshTokenRouter(env, timeout, db, publicRouter)
	frontend.Register(gin)
	protectedRouter := gin.Group("/api/v1")
	// Middleware to verify AccessToken
	protectedRouter.Use(middleware.JwtAuthMiddleware(env.AccessTokenSecret))
}
