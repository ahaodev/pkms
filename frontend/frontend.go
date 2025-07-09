package frontend

import (
	"embed"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

//go:embed dist/*
var Static embed.FS

func Register(r *gin.Engine) {
	r.Use(static.Serve("/", static.EmbedFolder(Static, "dist")))
}
