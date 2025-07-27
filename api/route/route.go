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

	// Public share routes (no authentication required)
	shareRouter := gin.Group("/share")
	NewShareRouter(env, timeout, db, fileStorage, shareRouter)

	// Public file download routes (no authentication required)
	publicFileRouter := gin.Group(ApiUri + "/files")
	NewPublicFileRouter(env, timeout, db, fileStorage, publicFileRouter)

	// Public client access routes (no authentication required, using access_token)
	publicClientAccessRouter := gin.Group("/client-access")
	NewPublicClientAccessRouter(env, timeout, db, publicClientAccessRouter)

	protectedRouter := gin.Group(ApiUri)
	// 安全的路由组，所有路由都需要认证
	protectedRouter.Use(middleware.JwtAuthMiddleware(env.AccessTokenSecret))
	NewRefreshTokenRouter(env, timeout, db, publicRouter)
	// 个人资料路由，允许所有认证用户访问
	profileRouter := protectedRouter.Group("/profile")
	NewProfileRouter(env, timeout, db, profileRouter)

	// 再通过casbin中间件进行权限控制
	// Casbin 权限管理路由（需要认证但不需要特定权限）
	casbinRouter := protectedRouter.Group("/casbin")
	NewCasbinRouter(env, timeout, db, casbinManager, casbinRouter)

	// DEMO阶段大胆简化：只保留核心权限检查！
	casbinMiddleware := middleware.NewCasbinMiddleware(casbinManager)

	// 🔥 业务功能路由 - manager及以上角色可访问（兼容旧的pm角色）
	projectRouter := protectedRouter.Group("/projects")
	projectRouter.Use(casbinMiddleware.RequireAnyRole([]string{domain.RoleAdmin, domain.RoleManager}))
	NewProjectRouter(env, timeout, db, projectRouter)

	packageRouter := protectedRouter.Group("/packages")
	//packageRouter.Use(casbinMiddleware.RequireAnyRole([]string{domain.RoleAdmin, domain.RoleManager}))
	NewPackageRouter(env, timeout, db, fileStorage, packageRouter)

	releaseRouter := protectedRouter.Group("/releases")
	//releaseRouter.Use(casbinMiddleware.RequireAnyRole([]string{domain.RoleAdmin, domain.RoleManager}))
	NewReleaseRouter(env, timeout, db, fileStorage, releaseRouter)

	// 🔥 系统管理路由 - 只有admin可访问
	userRouter := protectedRouter.Group("/user")
	userRouter.Use(casbinMiddleware.RequireRole(domain.RoleAdmin))
	NewUserRouter(env, timeout, db, userRouter)

	tenantRouter := protectedRouter.Group("/tenants")
	tenantRouter.Use(casbinMiddleware.RequireRole(domain.RoleAdmin))
	NewTenantRouter(env, timeout, db, casbinManager, tenantRouter)

	upgradeRouter := protectedRouter.Group("/upgrades")
	upgradeRouter.Use(casbinMiddleware.RequireAnyRole([]string{domain.RoleAdmin, domain.RoleManager}))
	NewUpgradeRouter(env, timeout, db, upgradeRouter)

	clientAccessRouter := protectedRouter.Group("/access-manager")
	clientAccessRouter.Use(casbinMiddleware.RequireAnyRole([]string{domain.RoleAdmin, domain.RoleManager}))
	NewAccessManagerRouter(env, timeout, db, clientAccessRouter)

	// 🔥 普通功能路由 - 登录即可访问
	dashboardRouter := protectedRouter.Group("/dashboard")
	// 仪表板允许所有认证用户访问
	NewDashboardRouter(env, timeout, db, dashboardRouter)

	fileRouter := protectedRouter.Group("/file")
	// 文件操作允许所有认证用户访问
	NewFileRouter(env, timeout, db, fileStorage, fileRouter)
}
