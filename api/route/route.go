package route

import (
	"pkms/frontend"
	"time"

	"pkms/api/middleware"
	"pkms/bootstrap"
	"pkms/ent"

	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
)

func Setup(env *bootstrap.Env, timeout time.Duration, db *ent.Client, minioClient *minio.Client, gin *gin.Engine) {
	frontend.Register(gin)
	publicRouter := gin.Group("/api/v1")
	// All Public APIs
	NewLoginRouter(env, timeout, db, publicRouter)
	NewRefreshTokenRouter(env, timeout, db, publicRouter)

	protectedRouter := gin.Group("/api/v1")
	// Middleware to verify AccessToken
	protectedRouter.Use(middleware.JwtAuthMiddleware(env.AccessTokenSecret))

	// Protected routes
	projectRouter := protectedRouter.Group("/project")
	NewProjectRouter(env, timeout, db, projectRouter)

	packageRouter := protectedRouter.Group("/package")
	NewPackageRouter(env, timeout, db, minioClient, packageRouter)

	userRouter := protectedRouter.Group("/user")
	NewUserRouter(env, timeout, db, userRouter)

	dashboardRouter := protectedRouter.Group("/dashboard")
	NewDashboardRouter(env, timeout, db, dashboardRouter)

	groupRouter := protectedRouter.Group("/group")
	NewGroupRouter(env, timeout, db, groupRouter)

	permissionRouter := protectedRouter.Group("/permission")
	NewPermissionRouter(env, timeout, db, permissionRouter)

	upgradeRouter := protectedRouter.Group("/upgrade")
	NewUpgradeRouter(env, timeout, db, upgradeRouter)

	// File management routes
	fileRouter := protectedRouter.Group("/file")
	NewFileRouter(env, timeout, db, minioClient, fileRouter)
}
