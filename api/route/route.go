package route

import (
	"fmt"
	"log"
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
	gin.RedirectTrailingSlash = true
	frontend.Register(gin)

	// 初始化 Casbin 管理器
	databaseDSN := env.DBPath
	if databaseDSN == "" {
		databaseDSN = "casbin.db" // 默认数据库文件
	}

	casbinManager, err := casbin.NewCasbinManager(databaseDSN)
	if err != nil {
		log.Printf("Failed to initialize Casbin manager: %v", err)
		// 继续运行，但没有权限控制
	} else {
		log.Println("Casbin 权限管理器初始化成功")
	}

	// 创建 Casbin 中间件
	var casbinMiddleware *middleware.CasbinMiddleware
	if casbinManager != nil {
		casbinMiddleware = middleware.NewCasbinMiddleware(casbinManager)
	}

	publicRouter := gin.Group(ApiUri)
	// All Public APIs
	NewLoginRouter(env, timeout, db, publicRouter)
	NewRefreshTokenRouter(env, timeout, db, publicRouter)

	protectedRouter := gin.Group(ApiUri)
	// Middleware to verify AccessToken
	protectedRouter.Use(middleware.JwtAuthMiddleware(env.AccessTokenSecret))

	// Casbin 权限管理路由（需要认证但不需要特定权限）
	if casbinManager != nil {
		casbinRouter := protectedRouter.Group("/casbin")
		NewCasbinRouter(env, timeout, db, casbinManager, casbinRouter)
	}

	// Protected routes with permission control
	projectRouter := protectedRouter.Group("/projects")
	if casbinMiddleware != nil {
		// 项目路由需要项目查看权限
		projectRouter.Use(casbinMiddleware.RequirePermission("project", "view"))
	}
	NewProjectRouter(env, timeout, db, projectRouter)

	packageRouter := protectedRouter.Group("/packages")
	if casbinMiddleware != nil {
		// 包路由需要包查看权限
		packageRouter.Use(casbinMiddleware.RequirePermission("package", "view"))
	}
	NewPackageRouter(env, timeout, db, minioClient, packageRouter)

	userRouter := protectedRouter.Group("/users")
	if casbinMiddleware != nil {
		// 用户路由需要用户查看权限
		userRouter.Use(casbinMiddleware.RequirePermission("user", "view"))
	}
	NewUserRouter(env, timeout, db, userRouter)

	dashboardRouter := protectedRouter.Group("/dashboard")
	// 仪表板允许所有认证用户访问
	NewDashboardRouter(env, timeout, db, dashboardRouter)

	groupRouter := protectedRouter.Group("/group")
	if casbinMiddleware != nil {
		// 组路由需要组查看权限
		groupRouter.Use(casbinMiddleware.RequirePermission("group", "view"))
	}
	NewGroupRouter(env, timeout, db, groupRouter)

	permissionRouter := protectedRouter.Group("/permission")
	if casbinMiddleware != nil {
		// 权限路由需要权限管理权限
		permissionRouter.Use(casbinMiddleware.RequirePermission("permission", "manage"))
	}
	NewPermissionRouter(env, timeout, db, permissionRouter)

	upgradeRouter := protectedRouter.Group("/upgrade")
	if casbinMiddleware != nil {
		// 升级路由需要系统管理员权限
		upgradeRouter.Use(casbinMiddleware.RequireRole("admin"))
	}
	NewUpgradeRouter(env, timeout, db, upgradeRouter)

	// File management routes
	fileRouter := protectedRouter.Group("/file")
	if casbinMiddleware != nil {
		// 文件路由需要文件查看权限
		fileRouter.Use(casbinMiddleware.RequirePermission("file", "view"))
	}
	NewFileRouter(env, timeout, db, minioClient, fileRouter)
}
