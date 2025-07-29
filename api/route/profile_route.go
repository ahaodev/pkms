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

func NewProfileRouter(app *bootstrap.Application, timeout time.Duration, db *ent.Client, group *gin.RouterGroup) {
	ur := repository.NewUserRepository(db)
	tr := repository.NewTenantRepository(db)
	uc := &controller.ProfileController{
		UserUsecase: usecase.NewUserUsecase(ur, tr, app.CasbinManager, timeout),
		Env:         app.Env,
	}
	group.GET("/", uc.GetProfile)             // GET /api/v1/profile
	group.PUT("/", uc.UpdateProfile)          // PUT /api/v1/profile
	group.PUT("/password", uc.UpdatePassword) // PUT /api/v1/profile/password
}
