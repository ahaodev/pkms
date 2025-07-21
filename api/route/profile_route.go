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

func NewProfileRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, group *gin.RouterGroup) {
	ur := repository.NewUserRepository(db)
	tr := repository.NewTenantRepository(db)
	uc := &controller.ProfileController{
		UserUsecase: usecase.NewUserUsecase(ur, tr, timeout),
		Env:         env,
	}
	group.GET("/", uc.GetProfile)    // GET /api/v1/users/profile
	group.PUT("/", uc.UpdateProfile) // PUT /api/v1/users/profile
}
