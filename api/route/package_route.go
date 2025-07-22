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

func NewPackageRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, minioClient *minio.Client, group *gin.RouterGroup) {
	pkgRepo := repository.NewPackageRepository(db)
	releaseRepo := repository.NewReleaseRepository(db)
	pc := &controller.PackageController{
		PackageUsecase: usecase.NewPackageUsecase(pkgRepo, releaseRepo, timeout),
		Env:            env,
	}

	// Package CRUD operations
	group.GET("/", pc.GetPackages)         // GET /api/v1/packages
	group.POST("/", pc.CreatePackage)      // POST /api/v1/packages
	group.GET("/:id", pc.GetPackage)       // GET /api/v1/packages/:id
	group.PUT("/:id", pc.UpdatePackage)    // PUT /api/v1/packages/:id
	group.DELETE("/:id", pc.DeletePackage) // DELETE /api/v1/packages/:id

	// Package specific operations
	group.GET("/project/:projectId", pc.GetProjectPackages) // GET /api/v1/packages/project/:projectId
}
