package route

import (
	"pkms/frontend"
	"time"

	"github.com/gin-gonic/gin"
	"pkms/api/middleware"
	"pkms/bootstrap"
	"pkms/ent"
)

func Setup(env *bootstrap.Env, timeout time.Duration, db *ent.Client, gin *gin.Engine) {
	publicRouter := gin.Group("")
	// All Public APIs
	NewLoginRouter(env, timeout, db, publicRouter)
	NewRefreshTokenRouter(env, timeout, db, publicRouter)
	frontend.Register(gin)
	protectedRouter := gin.Group("")
	// Middleware to verify AccessToken
	protectedRouter.Use(middleware.JwtAuthMiddleware(env.AccessTokenSecret))
}
