package route

import (
	"time"

	"pkms/api/controller"
	"pkms/bootstrap"
	"pkms/ent"
	"pkms/internal/casbin"
	"pkms/repository"
	"pkms/usecase"

	"github.com/gin-gonic/gin"
)

func NewDashboardRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, group *gin.RouterGroup) {
	// Dashboard needs multiple repositories
	ur := repository.NewUserRepository(db)
	pr := repository.NewProjectRepository(db)
	pkgRepo := repository.NewPackageRepository(db)
	releaseRepo := repository.NewReleaseRepository(db)

	// Create Casbin manager for permission checking
	casbinManager := casbin.NewCasbinManager(db)

	dc := &controller.DashboardController{
		DashboardUsecase: usecase.NewDashboardUsecase(pr, pkgRepo, ur, releaseRepo, casbinManager, timeout),
		Env:              env,
	}

	// Dashboard operations
	group.GET("/stats", dc.GetStats)                 // GET /api/v1/dashboard/stats
	group.GET("/activities", dc.GetRecentActivities) // GET /api/v1/dashboard/activities
}
