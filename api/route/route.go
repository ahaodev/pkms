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

	// 公开访问的路由组
	publicRouter := gin.Group(ApiUri)

	// 登录路由
	NewLoginRouter(env, timeout, db, publicRouter)

	// 公共访问路由
	shareRouter := gin.Group("/share")
	NewShareRouter(env, timeout, db, fileStorage, shareRouter)

	// 客户端接入路由,需要验证 access token
	publicClientAccessRouter := gin.Group("/client-access")
	NewPublicClientAccessRouter(env, timeout, db, fileStorage, publicClientAccessRouter)

	// 受保护的路由组
	protectedRouter := gin.Group(ApiUri)

	// 安全的路由组，所有路由都需要认证
	protectedRouter.Use(middleware.JwtAuthMiddleware(env.AccessTokenSecret))
	NewRefreshTokenRouter(env, timeout, db, publicRouter)

	// 个人资料路由，允许所有认证用户访问
	profileRouter := protectedRouter.Group("/profile")
	NewProfileRouter(app, timeout, db, profileRouter)

	// casbin 权限管理路由
	casbinRouter := protectedRouter.Group("/casbin")
	NewCasbinRouter(db, casbinManager, casbinRouter)

	// Casbin 中间件，用于权限验证
	casbinMiddleware := middleware.NewCasbinMiddleware(casbinManager)

	// 项目管理路由
	projectRouter := protectedRouter.Group("/projects")
	projectRouter.Use(casbinMiddleware.RequireAnyRole([]string{domain.SystemRoleAdmin, domain.TenantRoleOwner, domain.TenantRoleUser, domain.TenantRoleViewer}))
	NewProjectRouter(env, timeout, db, projectRouter)

	// 包管理路由
	packageRouter := protectedRouter.Group("/packages")
	packageRouter.Use(casbinMiddleware.RequireAnyRole([]string{domain.SystemRoleAdmin, domain.TenantRoleOwner, domain.TenantRoleUser, domain.TenantRoleViewer}))
	NewPackageRouter(env, timeout, db, fileStorage, packageRouter)

	// 版本发布管理路由
	releaseRouter := protectedRouter.Group("/releases")
	releaseRouter.Use(casbinMiddleware.RequireAnyRole([]string{domain.SystemRoleAdmin, domain.TenantRoleOwner, domain.TenantRoleUser, domain.TenantRoleViewer}))
	NewReleaseRouter(env, timeout, db, fileStorage, releaseRouter)

	// 接入管理路由
	clientAccessRouter := protectedRouter.Group("/access-manager")
	clientAccessRouter.Use(casbinMiddleware.RequireAnyRole([]string{domain.SystemRoleAdmin, domain.TenantRoleOwner, domain.TenantRoleUser, domain.TenantRoleViewer}))
	NewAccessManagerRouter(env, timeout, db, clientAccessRouter)

	// 分享管理路由
	shareManagementRouter := protectedRouter.Group("/shares")
	shareManagementRouter.Use(casbinMiddleware.RequireAnyRole([]string{domain.SystemRoleAdmin, domain.TenantRoleOwner, domain.TenantRoleUser, domain.TenantRoleViewer}))
	NewShareManagementRouter(env, timeout, db, fileStorage, shareManagementRouter)

	// 跟新和升级路由
	upgradeRouter := protectedRouter.Group("/upgrades")
	upgradeRouter.Use(casbinMiddleware.RequireAnyRole([]string{domain.SystemRoleAdmin, domain.TenantRoleOwner, domain.TenantRoleUser, domain.TenantRoleViewer}))
	NewUpgradeRouter(env, timeout, db, upgradeRouter)

	// 用户管理路由，只有管理员可以访问
	userRouter := protectedRouter.Group("/user")
	userRouter.Use(casbinMiddleware.RequireRole(domain.SystemRoleAdmin))
	NewUserRouter(app, timeout, db, userRouter)

	// 系统用户管理路由，只有管理员可以访问
	tenantRouter := protectedRouter.Group("/tenants")
	tenantRouter.Use(casbinMiddleware.RequireRole(domain.SystemRoleAdmin))
	NewTenantRouter(env, timeout, db, casbinManager, tenantRouter)

	// 普通功能路由 - 登录即可访问
	dashboardRouter := protectedRouter.Group("/dashboard")
	// 仪表板允许所有认证用户访问
	NewDashboardRouter(env, timeout, db, dashboardRouter)

	// 菜单管理路由，只有管理员可以访问
	menuRouter := protectedRouter.Group("/menu")
	menuRouter.Use(casbinMiddleware.RequireRole(domain.SystemRoleAdmin))
	NewMenuRouter(env, timeout, db, casbinManager, menuRouter)

	// 角色管理路由，只有管理员可以访问
	roleRouter := protectedRouter.Group("/role")
	roleRouter.Use(casbinMiddleware.RequireRole(domain.SystemRoleAdmin))
	NewRoleRouter(env, timeout, db, casbinManager, roleRouter)

	// 用户租户角色管理路由，只有管理员可以访问
	userTenantRoleRouter := protectedRouter.Group("/user-tenant-role")
	userTenantRoleRouter.Use(casbinMiddleware.RequireRole(domain.SystemRoleAdmin))
	NewUserTenantRoleRouter(env, timeout, db, casbinManager, userTenantRoleRouter)
}
