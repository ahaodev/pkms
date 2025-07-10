package route

import (
	"time"

	"pkms/api/controller"
	"pkms/bootstrap"
	"pkms/ent"
	"pkms/repository"
	"pkms/usecase"

	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
)

func NewFileRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, minioClient *minio.Client, group *gin.RouterGroup) {
	fr := repository.NewFileRepository(minioClient)

	fc := &controller.FileController{
		FileUsecase: usecase.NewFileUsecase(fr, timeout),
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
