package route

import (
	"fmt"
	"pkms/frontend"
	"time"

	"pkms/api/middleware"
	"pkms/bootstrap"
	"pkms/ent"
	"pkms/internal/casbin"

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
	gin.MaxMultipartMemory = 1000 << 20 // 1000 MB

	frontend.Register(gin)
	gin.RedirectTrailingSlash = true
	publicRouter := gin.Group(ApiUri)
	// All Public APIs
	NewLoginRouter(env, timeout, db, publicRouter)
	NewRefreshTokenRouter(env, timeout, db, publicRouter)

	protectedRouter := gin.Group(ApiUri)
	// 安全的路由组，所有路由都需要认证
	protectedRouter.Use(middleware.JwtAuthMiddleware(env.AccessTokenSecret))
	// 再通过casbin中间件进行权限控制
	casbinManager := casbin.NewCasbinManager(db)
	casbinManager.InitializeDefaultPolicies()
	// Casbin 权限管理路由（需要认证但不需要特定权限）
	casbinRouter := protectedRouter.Group("/casbin")
	NewCasbinRouter(env, timeout, db, casbinManager, casbinRouter)

	// Protected routes with permission control
	projectRouter := protectedRouter.Group("/projects")
	casbinMiddleware := middleware.NewCasbinMiddleware(casbinManager)
	projectRouter.Use(casbinMiddleware.RequirePermission("project", "view"))

	NewProjectRouter(env, timeout, db, projectRouter)

	packageRouter := protectedRouter.Group("/packages")
	packageRouter.Use(casbinMiddleware.RequirePermission("package", "view"))

	NewPackageRouter(env, timeout, db, minioClient, packageRouter)

	userRouter := protectedRouter.Group("/users")
	userRouter.Use(casbinMiddleware.RequirePermission("user", "view"))

	NewUserRouter(env, timeout, db, userRouter)

	dashboardRouter := protectedRouter.Group("/dashboard")
	// 仪表板允许所有认证用户访问
	NewDashboardRouter(env, timeout, db, dashboardRouter)

	upgradeRouter := protectedRouter.Group("/upgrade")
	upgradeRouter.Use(casbinMiddleware.RequireRole("admin"))

	NewUpgradeRouter(env, timeout, db, upgradeRouter)

	// File management routes
	fileRouter := protectedRouter.Group("/file")
	fileRouter.Use(casbinMiddleware.RequirePermission("file", "view"))

	NewFileRouter(env, timeout, db, minioClient, fileRouter)
}
