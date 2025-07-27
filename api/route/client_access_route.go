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

// NewClientAccessRouter 创建客户端接入管理路由（需要JWT认证和管理员权限）
func NewClientAccessRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, group *gin.RouterGroup) {
	clientAccessRepo := repository.NewClientAccessRepository(db)
	upgradeRepo := repository.NewUpgradeRepository(db)
	projectRepo := repository.NewProjectRepository(db)
	packageRepo := repository.NewPackageRepository(db)
	releaseRepo := repository.NewReleaseRepository(db)

	clientAccessUsecase := usecase.NewClientAccessUsecase(clientAccessRepo, projectRepo, packageRepo, timeout)
	upgradeUsecase := usecase.NewUpgradeUsecase(upgradeRepo, projectRepo, packageRepo, releaseRepo, timeout)

	cac := &controller.ClientAccessController{
		ClientAccessUsecase: clientAccessUsecase,
		UpgradeUsecase:      upgradeUsecase,
		Env:                 env,
	}

	// Client access CRUD operations (需要管理员权限)
	group.POST("/", cac.CreateClientAccess)            // POST /api/v1/client-access
	group.GET("/", cac.GetClientAccessList)            // GET /api/v1/client-access
	group.GET("/:id", cac.GetClientAccess)             // GET /api/v1/client-access/:id
	group.PUT("/:id", cac.UpdateClientAccess)          // PUT /api/v1/client-access/:id
	group.DELETE("/:id", cac.DeleteClientAccess)       // DELETE /api/v1/client-access/:id
	group.POST("/:id/regenerate", cac.RegenerateToken) // POST /api/v1/client-access/:id/regenerate
}

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
	group.POST("/check-update", cac.CheckUpdate) // POST /client-access/check-update
}
