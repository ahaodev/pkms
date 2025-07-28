package route

import (
	"time"

	"pkms/api/controller"
	"pkms/bootstrap"
	"pkms/domain"
	"pkms/ent"
	"pkms/repository"
	"pkms/usecase"

	"github.com/gin-gonic/gin"
)

// NewPublicClientAccessRouter 创建公开的客户端接入路由（无需JWT认证，使用access_token）
func NewPublicClientAccessRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, fileStorage domain.FileRepository, group *gin.RouterGroup) {
	clientAccessRepo := repository.NewClientAccessRepository(db)
	upgradeRepo := repository.NewUpgradeRepository(db)
	projectRepo := repository.NewProjectRepository(db)
	packageRepo := repository.NewPackageRepository(db)
	releaseRepo := repository.NewReleaseRepository(db)

	clientAccessUsecase := usecase.NewClientAccessUsecase(clientAccessRepo, projectRepo, packageRepo, timeout)
	upgradeUsecase := usecase.NewUpgradeUsecaseWithClientAccess(upgradeRepo, projectRepo, packageRepo, releaseRepo, clientAccessRepo, timeout)
	fileUsecase := usecase.NewFileUsecase(fileStorage, timeout)
	releaseUsecase := usecase.NewReleaseUsecase(releaseRepo, packageRepo, fileStorage, env, timeout)

	cac := &controller.ClientAccessController{
		ClientAccessUsecase: clientAccessUsecase,
		UpgradeUsecase:      upgradeUsecase,
		FileUsecase:         fileUsecase,
		ReleaseUsecase:      releaseUsecase,
		Env:                 env,
	}

	// Public client operations (无需JWT认证，使用access_token验证)
	group.POST("/check", cac.CheckUpdate)    // POST /client-access/check
	group.GET("/download/:id", cac.Download) // GET /client-access/download/:id?access_token=xxx
}
