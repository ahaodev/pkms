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

func NewUpgradeRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, group *gin.RouterGroup) {
	ur := repository.NewUpgradeRepository(db)
	pr := repository.NewProjectRepository(db)
	pkgRepo := repository.NewPackageRepository(db)
	releaseRepo := repository.NewReleaseRepository(db)

	uc := &controller.UpgradeController{
		UpgradeUsecase: usecase.NewUpgradeUsecase(ur, pr, pkgRepo, releaseRepo, timeout),
		Env:            env,
	}

	// Upgrade target CRUD operations
	group.POST("/", uc.CreateUpgradeTarget)      // POST /api/v1/upgrades
	group.GET("/", uc.GetUpgradeTargets)         // GET /api/v1/upgrades
	group.GET("/:id", uc.GetUpgradeTarget)       // GET /api/v1/upgrades/:id
	group.PUT("/:id", uc.UpdateUpgradeTarget)    // PUT /api/v1/upgrades/:id
	group.DELETE("/:id", uc.DeleteUpgradeTarget) // DELETE /api/v1/upgrades/:id

	// Client update operations
	group.POST("/check", uc.CheckUpdate) // POST /api/v1/upgrades/check

	// Project specific operations
	group.GET("/projects/:projectId", uc.GetProjectUpgradeTargets) // GET /api/v1/upgrades/projects/:projectId
}
