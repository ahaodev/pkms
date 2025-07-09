package frontend

import (
	"embed"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

//go:embed dist/*
var Static embed.FS

func Register(r *gin.Engine) {
	fs, err := static.EmbedFolder(Static, "dist")
	if err != nil {
		panic("静态文件映射错误,请检查前端是否构建" + err.Error())
	}
	r.Use(static.Serve("/", fs))
}
