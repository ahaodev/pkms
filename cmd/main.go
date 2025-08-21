package main

import (
	"pkms/pkg"
	"time"

	"pkms/api/route"
	"pkms/bootstrap"
	"pkms/internal/initializer"

	"github.com/gin-gonic/gin"
)

// 构建时注入的版本信息
var (
	version = "dev"
	commit  = "unknown"
	date    = "unknown"
)

// @title           PKMS API
// @version         1.0
// @description     Package Management System API for managing projects, packages, and users with RBAC.
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.swagger.io/support
// @contact.email  support@swagger.io

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:65080
// @BasePath  /api

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	// 记录版本信息
	pkg.Log.Infof("PKMS starting - Version: %s, Commit: %s, Built: %s", version, commit, date)

	app := bootstrap.App()
	defer app.CloseDBConnection()

	env := app.Env
	db := app.DB
	fileStorage := app.FileStorage
	casbin := app.CasbinManager
	timeout := time.Duration(env.ContextTimeout) * time.Second

	// 初始化RBAC系统（必须在admin用户创建之前）
	rbacInitializer := initializer.NewRBACInitializer(db, casbin)
	if err := rbacInitializer.Initialize(); err != nil {
		pkg.Log.Errorf("RBAC系统初始化失败: %v", err)
		// 不能因为初始化失败就停止系统启动，记录错误并继续
	} else {
		pkg.Log.Info("RBAC系统初始化成功")
	}

	// 现在初始化admin用户（在RBAC系统初始化之后）
	bootstrap.InitDefaultAdmin(db, env, casbin)

	apiEngine := gin.Default()
	route.Setup(app, timeout, db, casbin, fileStorage, apiEngine)
	err := apiEngine.Run(":65080")
	if err != nil {
		pkg.Log.Error(err)
	}
}
