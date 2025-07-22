package route

import (
	"time"

	"pkms/api/controller"
	"pkms/bootstrap"
	"pkms/domain"
	"pkms/ent"
	"pkms/usecase"

	"github.com/gin-gonic/gin"
)

func NewFileRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, fileStorage domain.FileRepository, group *gin.RouterGroup) {
	fc := &controller.FileController{
		FileUsecase: usecase.NewFileUsecase(fileStorage, timeout),
		Env:         env,
	}

	// File operations
	group.GET("", fc.List)                        // GET /api/v1/files?bucket=xxx&prefix=xxx
	group.POST("/upload", fc.Upload)              // POST /api/v1/files/upload
	group.GET("/download/:name", fc.Download)     // GET /api/v1/files/download/:name
	group.GET("/stream", fc.DownloadWithProgress) // GET /api/v1/files/stream?bucket=xxx&object=xxx
	group.DELETE("", fc.Delete)                   // DELETE /api/v1/files?bucket=xxx&object=xxx
	group.GET("/info/:name", fc.GetObjectInfo)    // GET /api/v1/files/info/:name
}
