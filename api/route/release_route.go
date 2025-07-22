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

func NewReleaseRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, minioClient *minio.Client, group *gin.RouterGroup) {
	releaseRepo := repository.NewReleaseRepository(db)
	fileRepository := repository.NewFileRepository(minioClient)
	pr := repository.NewPackageRepository(db)

	rc := &controller.ReleaseController{
		ReleaseUsecase: usecase.NewReleaseUsecase(releaseRepo, pr, fileRepository, timeout),
		FileUsecase:    usecase.NewFileUsecase(fileRepository, timeout),
		Env:            env,
	}

	// Release CRUD operations
	group.GET("/package/:package_id", rc.GetReleases) // GET /api/v1/releases/package/:package_id
	group.GET("/:id", rc.GetRelease)                  // GET /api/v1/releases/:id
	group.POST("/", rc.UploadRelease)                 // POST /api/v1/releases
	group.PUT("/:id", rc.UpdateRelease)               // PUT /api/v1/releases/:id
	group.DELETE("/:id", rc.DeleteRelease)            // DELETE /api/v1/releases/:id

	// Release specific operations
	group.GET("/:id/download", rc.DownloadRelease)                // GET /api/v1/releases/:id/download
	group.GET("/package/:package_id/latest", rc.GetLatestRelease) // GET /api/v1/releases/package/:package_id/latest
	group.POST("/:id/set-latest", rc.SetLatestRelease)            // POST /api/v1/releases/:id/set-latest

	// Release sharing operations
	group.POST("/:id/share", rc.CreateShareLink)                  // POST /api/v1/releases/:id/share
	group.GET("/share/:token", rc.GetSharedRelease)               // GET /api/v1/releases/share/:token
	group.GET("/share/:token/download", rc.DownloadSharedRelease) // GET /api/v1/releases/share/:token/download
}
