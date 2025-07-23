package route

import (
	"fmt"
	"pkms/frontend"
	"time"

	"pkms/api/middleware"
	"pkms/bootstrap"
	"pkms/domain"
	"pkms/ent"
	"pkms/internal/casbin"

	"github.com/gin-gonic/gin"
)

const ApiUri = "/api/v1"

func Setup(env *bootstrap.Env, timeout time.Duration, db *ent.Client, casbinManager *casbin.CasbinManager, fileStorage domain.FileRepository, gin *gin.Engine) {
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

	// Public share routes (no authentication required)
	shareRouter := gin.Group("/share")
	NewShareRouter(env, timeout, db, fileStorage, shareRouter)

	protectedRouter := gin.Group(ApiUri)
	// 安全的路由组，所有路由都需要认证
	protectedRouter.Use(middleware.JwtAuthMiddleware(env.AccessTokenSecret))

	// 个人资料路由，允许所有认证用户访问
	profileRouter := protectedRouter.Group("/profile")
	NewProfileRouter(env, timeout, db, profileRouter)

	// 再通过casbin中间件进行权限控制
	// Casbin 权限管理路由（需要认证但不需要特定权限）
	casbinRouter := protectedRouter.Group("/casbin")
	NewCasbinRouter(env, timeout, db, casbinManager, casbinRouter)

	// Protected routes with permission control
	projectRouter := protectedRouter.Group("/projects")
	casbinMiddleware := middleware.NewCasbinMiddleware(casbinManager)
	projectRouter.Use(casbinMiddleware.RequirePermission("project", "read"))

	NewProjectRouter(env, timeout, db, projectRouter)

	packageRouter := protectedRouter.Group("/packages")
	packageRouter.Use(casbinMiddleware.RequirePermission("package", "read"))

	NewPackageRouter(env, timeout, db, fileStorage, packageRouter)

	releaseRouter := protectedRouter.Group("/releases")
	releaseRouter.Use(casbinMiddleware.RequirePermission("package", "read"))

	NewReleaseRouter(env, timeout, db, fileStorage, releaseRouter)

	userRouter := protectedRouter.Group("/user")
	userRouter.Use(casbinMiddleware.RequirePermission("user", "read"))

	NewUserRouter(env, timeout, db, userRouter)

	// Tenant management routes - admin only
	tenantRouter := protectedRouter.Group("/tenants")
	tenantRouter.Use(casbinMiddleware.RequireRole("admin"))
	NewTenantRouter(env, timeout, db, tenantRouter)

	dashboardRouter := protectedRouter.Group("/dashboard")
	// 仪表板允许所有认证用户访问
	NewDashboardRouter(env, timeout, db, dashboardRouter)

	upgradeRouter := protectedRouter.Group("/upgrade")
	upgradeRouter.Use(casbinMiddleware.RequireRole("admin"))

	NewUpgradeRouter(env, timeout, db, upgradeRouter)

	// File management routes
	fileRouter := protectedRouter.Group("/file")
	fileRouter.Use(casbinMiddleware.RequirePermission("file", "read"))

	NewFileRouter(env, timeout, db, fileStorage, fileRouter)
}
