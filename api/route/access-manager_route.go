package route

import (
	"github.com/gin-gonic/gin"
	"pkms/api/controller"
	"pkms/bootstrap"
	"pkms/ent"
	"pkms/repository"
	"pkms/usecase"
	"time"
)

// NewAccessManagerRouter 创建客户端接入管理路由（需要JWT认证和管理员权限）
func NewAccessManagerRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, group *gin.RouterGroup) {
	clientAccessRepo := repository.NewClientAccessRepository(db)
	upgradeRepo := repository.NewUpgradeRepository(db)
	projectRepo := repository.NewProjectRepository(db)
	packageRepo := repository.NewPackageRepository(db)
	releaseRepo := repository.NewReleaseRepository(db)

	clientAccessUsecase := usecase.NewClientAccessUsecase(clientAccessRepo, projectRepo, packageRepo, timeout)
	upgradeUsecase := usecase.NewUpgradeUsecase(upgradeRepo, projectRepo, packageRepo, releaseRepo, timeout)

	cac := &controller.AccessManagerController{
		ClientAccessUsecase: clientAccessUsecase,
		UpgradeUsecase:      upgradeUsecase,
		Env:                 env,
	}

	// Client access CRUD operations (需要管理员权限)
	group.POST("/", cac.CreateClientAccess)            // POST /api/v1/access-manager
	group.GET("/", cac.GetClientAccessList)            // GET /api/v1/access-manager
	group.GET("/:id", cac.GetClientAccess)             // GET /api/v1/access-manager/:id
	group.PUT("/:id", cac.UpdateClientAccess)          // PUT /api/v1/access-manager/:id
	group.DELETE("/:id", cac.DeleteClientAccess)       // DELETE /api/v1/access-manager/:id
	group.POST("/:id/regenerate", cac.RegenerateToken) // POST /api/v1/access-manager/:id/regenerate
}
