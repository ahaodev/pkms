package route

import (
	"time"

	"github.com/gin-gonic/gin"
	"pkms/api/controller"
	"pkms/bootstrap"
	"pkms/ent"
	"pkms/internal"
	"pkms/repository"
	"pkms/usecase"
)

func NewLoginRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, group *gin.RouterGroup) {
	ur := repository.NewUserRepository(db)
	lc := &controller.LoginController{
		LoginUsecase:    usecase.NewLoginUsecase(ur, timeout),
		Env:             env,
		SecurityManager: internal.NewLoginSecurityManager(),
	}
	group.POST("/login", lc.Login)
}
