package main

import (
	"time"

	"github.com/gin-gonic/gin"
	route "pkms/api/route"
	"pkms/bootstrap"
)

func main() {

	app := bootstrap.App()

	env := app.Env

	defer app.CloseDBConnection()

	timeout := time.Duration(env.ContextTimeout) * time.Second

	gin := gin.Default()

	route.Setup(env, timeout, app.DB, gin)

	gin.Run(env.ServerAddress)
}
