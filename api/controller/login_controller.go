package controller

import (
	"fmt"
	"net/http"

	"golang.org/x/crypto/bcrypt"

	"github.com/gin-gonic/gin"
	"pkms/bootstrap"
	"pkms/domain"
)

type LoginController struct {
	LoginUsecase domain.LoginUsecase
	Env          *bootstrap.Env
}

func (lc *LoginController) Login(c *gin.Context) {
	var request domain.LoginRequest

	err := c.ShouldBind(&request)
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("Invalid request format"))
		return
	}

	user, err := lc.LoginUsecase.GetUserByUserName(c, request.UserName)
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.RespError("Invalid credentials"))
		return
	}
	fmt.Println(user.Password)
	// 直接比较明文密码和存储的哈希值
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.RespError("Invalid credentials"))
		return
	}

	accessToken, err := lc.LoginUsecase.CreateAccessToken(&user, lc.Env.AccessTokenSecret, lc.Env.AccessTokenExpiryHour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	refreshToken, err := lc.LoginUsecase.CreateRefreshToken(&user, lc.Env.RefreshTokenSecret, lc.Env.RefreshTokenExpiryHour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	loginResponse := domain.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(loginResponse))
}
