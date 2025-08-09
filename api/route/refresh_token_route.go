package route

import (
	"time"

	"github.com/gin-gonic/gin"
	"pkms/api/controller"
	"pkms/bootstrap"
	"pkms/ent"
	"pkms/internal/tokenservice"
	"pkms/repository"
	"pkms/usecase"
)

func NewRefreshTokenRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, group *gin.RouterGroup) {
	ur := repository.NewUserRepository(db)
	tokenService := tokenservice.NewTokenService()
	rtc := &controller.RefreshTokenController{
		RefreshTokenUsecase: usecase.NewRefreshTokenUsecase(ur, timeout),
		Env:                 env,
		TokenService:        tokenService,
	}
	group.POST("/refresh", rtc.RefreshToken)
}
