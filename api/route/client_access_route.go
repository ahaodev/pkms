package route

import (
	"time"

	"pkms/api/controller"
	"pkms/bootstrap"
	"pkms/ent"
	"pkms/repository"
	"pkms/usecase"

	"github.com/gin-gonic/gin"
)

// NewPublicClientAccessRouter 创建公开的客户端接入路由（无需JWT认证，使用access_token）
func NewPublicClientAccessRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, group *gin.RouterGroup) {
	clientAccessRepo := repository.NewClientAccessRepository(db)
	upgradeRepo := repository.NewUpgradeRepository(db)
	projectRepo := repository.NewProjectRepository(db)
	packageRepo := repository.NewPackageRepository(db)
	releaseRepo := repository.NewReleaseRepository(db)

	clientAccessUsecase := usecase.NewClientAccessUsecase(clientAccessRepo, projectRepo, packageRepo, timeout)
	upgradeUsecase := usecase.NewUpgradeUsecaseWithClientAccess(upgradeRepo, projectRepo, packageRepo, releaseRepo, clientAccessRepo, timeout)

	cac := &controller.ClientAccessController{
		ClientAccessUsecase: clientAccessUsecase,
		UpgradeUsecase:      upgradeUsecase,
		Env:                 env,
	}

	// Public client operations (无需JWT认证，使用access_token验证)
	group.POST("/check-update", cac.CheckUpdate) // POST /access-manager/check-update
}
