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
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

const ApiUri = "/api/v1"

func Setup(app *bootstrap.Application, timeout time.Duration, db *ent.Client, casbinManager *casbin.CasbinManager, fileStorage domain.FileRepository, gin *gin.Engine) {
	env := app.Env
	trustedProxies := []string{
		"127.0.0.1",
	}
	if err := gin.SetTrustedProxies(trustedProxies); err != nil {
		fmt.Printf("server: %s", err)
	}
	gin.MaxMultipartMemory = 1000 << 20 // 1000 MB

	frontend.Register(gin)
	gin.RedirectTrailingSlash = true

	// Swagger documentation
	gin.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

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
	NewPublicClientAccessRouter(env, timeout, db, fileStorage, publicClientAccessRouter)

	protectedRouter := gin.Group(ApiUri)
	// 安全的路由组，所有路由都需要认证
	protectedRouter.Use(middleware.JwtAuthMiddleware(env.AccessTokenSecret))
	NewRefreshTokenRouter(env, timeout, db, publicRouter)
	// 个人资料路由，允许所有认证用户访问
	profileRouter := protectedRouter.Group("/profile")
	NewProfileRouter(app, timeout, db, profileRouter)

	// 再通过casbin中间件进行权限控制
	// Casbin 权限管理路由（需要认证但不需要特定权限）
	casbinRouter := protectedRouter.Group("/casbin")
	NewCasbinRouter(env, timeout, db, casbinManager, casbinRouter)

	// DEMO阶段大胆简化：只保留核心权限检查！
	casbinMiddleware := middleware.NewCasbinMiddleware(casbinManager)

	// 🔥 业务功能路由 - 认证用户都可访问项目（admin, owner, user）
	projectRouter := protectedRouter.Group("/projects")
	projectRouter.Use(casbinMiddleware.RequireAnyRole([]string{domain.SystemRoleAdmin, domain.TenantRoleOwner, domain.TenantRoleUser, domain.TenantRoleViewer}))
	NewProjectRouter(env, timeout, db, projectRouter)

	packageRouter := protectedRouter.Group("/packages")
	packageRouter.Use(casbinMiddleware.RequireAnyRole([]string{domain.SystemRoleAdmin, domain.TenantRoleOwner, domain.TenantRoleUser, domain.TenantRoleViewer}))
	NewPackageRouter(env, timeout, db, fileStorage, packageRouter)

	releaseRouter := protectedRouter.Group("/releases")
	releaseRouter.Use(casbinMiddleware.RequireAnyRole([]string{domain.SystemRoleAdmin, domain.TenantRoleOwner, domain.TenantRoleUser, domain.TenantRoleViewer}))
	NewReleaseRouter(env, timeout, db, fileStorage, releaseRouter)

	// 🔥 系统管理路由 - 只有admin可访问
	userRouter := protectedRouter.Group("/user")
	userRouter.Use(casbinMiddleware.RequireRole(domain.SystemRoleAdmin))
	NewUserRouter(app, timeout, db, userRouter)

	tenantRouter := protectedRouter.Group("/tenants")
	tenantRouter.Use(casbinMiddleware.RequireRole(domain.SystemRoleAdmin))
	NewTenantRouter(env, timeout, db, casbinManager, tenantRouter)

	upgradeRouter := protectedRouter.Group("/upgrades")
	upgradeRouter.Use(casbinMiddleware.RequireAnyRole([]string{domain.SystemRoleAdmin, domain.TenantRoleOwner, domain.TenantRoleUser, domain.TenantRoleViewer}))
	NewUpgradeRouter(env, timeout, db, upgradeRouter)

	clientAccessRouter := protectedRouter.Group("/access-manager")
	clientAccessRouter.Use(casbinMiddleware.RequireAnyRole([]string{domain.SystemRoleAdmin, domain.TenantRoleOwner, domain.TenantRoleUser, domain.TenantRoleViewer}))
	NewAccessManagerRouter(env, timeout, db, clientAccessRouter)

	shareManagementRouter := protectedRouter.Group("/shares")
	shareManagementRouter.Use(casbinMiddleware.RequireAnyRole([]string{domain.SystemRoleAdmin, domain.TenantRoleOwner, domain.TenantRoleUser, domain.TenantRoleViewer}))
	NewShareManagementRouter(env, timeout, db, fileStorage, shareManagementRouter)

	// 🔥 普通功能路由 - 登录即可访问
	dashboardRouter := protectedRouter.Group("/dashboard")
	// 仪表板允许所有认证用户访问
	NewDashboardRouter(env, timeout, db, dashboardRouter)

	fileRouter := protectedRouter.Group("/file")
	// 文件操作允许所有认证用户访问
	NewFileRouter(env, timeout, db, fileStorage, fileRouter)

	// 🔥 系统设置路由 - 只有admin可访问
	settingsRouter := protectedRouter.Group("/settings")
	settingsRouter.Use(casbinMiddleware.RequireRole(domain.SystemRoleAdmin))
	NewSettingRouter(app, timeout, db, settingsRouter)
}
