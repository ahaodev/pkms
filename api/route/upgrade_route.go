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
	pkgRepo := repository.NewPackageRepository(db)

	uc := &controller.UpgradeController{
		UpgradeUsecase: usecase.NewUpgradeUsecase(ur, pkgRepo, timeout),
		Env:            env,
	}

	// Upgrade operations
	group.GET("/check/:packageId", uc.CheckUpgrade)             // GET /api/v1/upgrades/check/:packageId
	group.POST("/perform/:packageId", uc.PerformUpgrade)        // POST /api/v1/upgrades/perform/:packageId
	group.GET("/history/:packageId", uc.GetUpgradeHistory)      // GET /api/v1/upgrades/history/:packageId
	group.GET("/available/:projectId", uc.GetAvailableUpgrades) // GET /api/v1/upgrades/available/:projectId

	// Upgrade status operations
	group.GET("/status/:upgradeId", uc.GetUpgradeStatus) // GET /api/v1/upgrades/status/:upgradeId
	group.POST("/cancel/:upgradeId", uc.CancelUpgrade)   // POST /api/v1/upgrades/cancel/:upgradeId
}
