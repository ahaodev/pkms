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

// NewPublicFileRouter 公开的文件路由（无需认证）
func NewPublicFileRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, fileStorage domain.FileRepository, group *gin.RouterGroup) {
	fc := &controller.FileController{
		FileUsecase: usecase.NewFileUsecase(fileStorage, timeout),
		Env:         env,
	}

	// Public file download operations (no authentication required)
	group.GET("/download/:name", fc.Download)     // GET /api/v1/files/download/:name
	group.GET("/stream", fc.DownloadWithProgress) // GET /api/v1/files/stream?bucket=xxx&object=xxx
}

func NewFileRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, fileStorage domain.FileRepository, group *gin.RouterGroup) {
	fc := &controller.FileController{
		FileUsecase: usecase.NewFileUsecase(fileStorage, timeout),
		Env:         env,
	}

	// File operations (authentication required)
	group.GET("", fc.List)                     // GET /api/v1/file?bucket=xxx&prefix=xxx
	group.POST("/upload", fc.Upload)           // POST /api/v1/file/upload
	group.DELETE("", fc.Delete)                // DELETE /api/v1/file?bucket=xxx&object=xxx
	group.GET("/info/:name", fc.GetObjectInfo) // GET /api/v1/file/info/:name
}
