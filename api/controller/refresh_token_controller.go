package controller

import (
	"net/http"

	"pkms/bootstrap"
	"pkms/domain"
	"pkms/internal/tokenservice"

	"github.com/gin-gonic/gin"
)

type RefreshTokenController struct {
	RefreshTokenUsecase domain.RefreshTokenUsecase
	Env                 *bootstrap.Env
	TokenService        *tokenservice.TokenService
}

// RefreshToken 刷新访问令牌
// @Summary      Refresh access token
// @Description  Generate new access and refresh tokens using a valid refresh token
// @Tags         Authentication
// @Accept       json
// @Produce      json
// @Param        request  body      domain.RefreshTokenRequest  true  "Refresh token request"
// @Success      200      {object}  domain.RefreshTokenResponse  "Successfully refreshed tokens"
// @Failure      400      {object}  domain.Response  "Bad request - invalid parameters"
// @Failure      401      {object}  domain.Response  "Unauthorized - invalid or expired refresh token"
// @Failure      500      {object}  domain.Response  "Internal server error"
// @Router       /refresh [post]
func (rtc *RefreshTokenController) RefreshToken(c *gin.Context) {
	var request domain.RefreshTokenRequest

	err := c.ShouldBind(&request)
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	id, err := rtc.RefreshTokenUsecase.ExtractIDFromToken(request.RefreshToken, rtc.Env.RefreshTokenSecret)
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.RespError("Invalid refresh token"))
		return
	}

	user, err := rtc.RefreshTokenUsecase.GetUserByID(c, id)
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.RespError("User not found"))
		return
	}

	accessToken, err := rtc.TokenService.CreateAccessToken(user, rtc.Env.AccessTokenSecret, rtc.Env.AccessTokenExpiryHour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	refreshToken, err := rtc.TokenService.CreateRefreshToken(user, rtc.Env.RefreshTokenSecret, rtc.Env.RefreshTokenExpiryHour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	refreshTokenResponse := domain.RefreshTokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	c.JSON(http.StatusOK, refreshTokenResponse)
}
