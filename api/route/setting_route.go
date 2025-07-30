package route

import (
	"time"

	"pkms/api/controller"
	"pkms/bootstrap"
	"pkms/ent"

	"github.com/gin-gonic/gin"
)

func NewSettingRouter(app *bootstrap.Application, timeout time.Duration, db *ent.Client, group *gin.RouterGroup) {
	sc := &controller.SettingController{
		Env: app.Env,
	}

	// Storage configuration routes
	storageGroup := group.Group("/storage")
	storageGroup.GET("/", sc.GetStorageConfig)       // GET /api/v1/settings/storage
	storageGroup.PUT("/", sc.UpdateStorageConfig)    // PUT /api/v1/settings/storage
	storageGroup.POST("/test", sc.TestStorageConfig) // POST /api/v1/settings/storage/test
}
