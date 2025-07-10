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

func NewDashboardRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, group *gin.RouterGroup) {
	// Dashboard needs multiple repositories
	ur := repository.NewUserRepository(db)
	pr := repository.NewProjectRepository(db)
	pkgRepo := repository.NewPackageRepository(db)
	gr := repository.NewGroupRepository(db)

	dc := &controller.DashboardController{
		DashboardUsecase: usecase.NewDashboardUsecase(pr, pkgRepo, ur, gr, timeout),
		Env:              env,
	}

	// Dashboard operations
	group.GET("/stats", dc.GetStats)                        // GET /api/v1/dashboard/stats
	group.GET("/activities", dc.GetRecentActivities)        // GET /api/v1/dashboard/activities
	group.GET("/charts/packages", dc.GetPackageChartData)   // GET /api/v1/dashboard/charts/packages
	group.GET("/charts/users", dc.GetUserChartData)         // GET /api/v1/dashboard/charts/users
	group.GET("/charts/downloads", dc.GetDownloadChartData) // GET /api/v1/dashboard/charts/downloads
}
