package main

import (
	"pkms/pkg"
	"time"

	"pkms/api/route"
	"pkms/bootstrap"
	_ "pkms/docs"

	"github.com/gin-gonic/gin"
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

// @host      localhost:8080
// @BasePath  /api

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {

	app := bootstrap.App()
	defer app.CloseDBConnection()

	env := app.Env
	db := app.DB
	fileStorage := app.FileStorage
	casbin := app.CasbinManager
	timeout := time.Duration(env.ContextTimeout) * time.Second

	apiEngine := gin.Default()
	route.Setup(app, timeout, db, casbin, fileStorage, apiEngine)
	err := apiEngine.Run(":8080")
	if err != nil {
		pkg.Log.Error(err)
	}
}
