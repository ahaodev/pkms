package route

import (
	"pkms/frontend"
	"time"

	"pkms/api/middleware"
	"pkms/bootstrap"
	"pkms/ent"

	"github.com/gin-gonic/gin"
)

var APIv1 *gin.RouterGroup

func Setup(env *bootstrap.Env, timeout time.Duration, db *ent.Client, gin *gin.Engine) {
	frontend.Register(gin)
	publicRouter := gin.Group("/api/v1")
	// All Public APIs
	NewLoginRouter(env, timeout, db, publicRouter)
	NewRefreshTokenRouter(env, timeout, db, publicRouter)

	protectedRouter := gin.Group("/api/v1")
	// Middleware to verify AccessToken
	protectedRouter.Use(middleware.JwtAuthMiddleware(env.AccessTokenSecret))

	// Protected routes
	projectRouter := protectedRouter.Group("/projects")
	NewProjectRouter(env, timeout, db, projectRouter)

	packageRouter := protectedRouter.Group("/packages")
	NewPackageRouter(env, timeout, db, packageRouter)

	userRouter := protectedRouter.Group("/users")
	NewUserRouter(env, timeout, db, userRouter)

	dashboardRouter := protectedRouter.Group("/dashboard")
	NewDashboardRouter(env, timeout, db, dashboardRouter)

	groupRouter := protectedRouter.Group("/groups")
	NewGroupRouter(env, timeout, db, groupRouter)

	permissionRouter := protectedRouter.Group("/permissions")
	NewPermissionRouter(env, timeout, db, permissionRouter)

	upgradeRouter := protectedRouter.Group("/upgrades")
	NewUpgradeRouter(env, timeout, db, upgradeRouter)
}
