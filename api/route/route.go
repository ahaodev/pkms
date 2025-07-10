package route

import (
	"fmt"
	"pkms/frontend"
	"time"

	//"pkms/api/middleware"
	"pkms/bootstrap"
	"pkms/ent"

	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
)

const ApiUri = "/api/v1"

func Setup(env *bootstrap.Env, timeout time.Duration, db *ent.Client, minioClient *minio.Client, gin *gin.Engine) {
	trustedProxies := []string{
		"127.0.0.1",
	}
	if err := gin.SetTrustedProxies(trustedProxies); err != nil {
		fmt.Printf("server: %s", err)
	}
	gin.RedirectTrailingSlash = true
	frontend.Register(gin)
	publicRouter := gin.Group(ApiUri)
	// All Public APIs
	NewLoginRouter(env, timeout, db, publicRouter)
	NewRefreshTokenRouter(env, timeout, db, publicRouter)

	protectedRouter := gin.Group(ApiUri)
	// Middleware to verify AccessToken
	//protectedRouter.Use(middleware.JwtAuthMiddleware(env.AccessTokenSecret))

	// Protected routes
	projectRouter := protectedRouter.Group("/projects")
	NewProjectRouter(env, timeout, db, projectRouter)

	packageRouter := protectedRouter.Group("/packages")
	NewPackageRouter(env, timeout, db, minioClient, packageRouter)

	userRouter := protectedRouter.Group("/users")
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
