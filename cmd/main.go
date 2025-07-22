package main

import (
	"pkms/pkg"
	"time"

	"pkms/api/route"
	"pkms/bootstrap"

	"github.com/gin-gonic/gin"
)

func main() {

	app := bootstrap.App()
	defer app.CloseDBConnection()

	env := app.Env
	db := app.DB
	fileStorage := app.FileStorage
	casbin := app.CasbinManager
	timeout := time.Duration(env.ContextTimeout) * time.Second

	apiEngine := gin.Default()
	route.Setup(env, timeout, db, casbin, fileStorage, apiEngine)
	err := apiEngine.Run(":8080")
	if err != nil {
		pkg.Log.Error(err)
	}
}
