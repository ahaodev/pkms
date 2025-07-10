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
	s3 := app.MinioClient
	timeout := time.Duration(env.ContextTimeout) * time.Second
	route.Setup(env, timeout, db, s3, gin.Default())
	err := gin.Default().Run(env.ServerAddress)
	if err != nil {
		pkg.Log.Error(err)
	}
}
