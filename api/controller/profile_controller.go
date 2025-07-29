package controller

import (
	"net/http"
	"pkms/internal/constants"

	"pkms/bootstrap"
	"pkms/domain"

	"github.com/gin-gonic/gin"
)

type ProfileController struct {
	UserUsecase domain.UserUseCase
	Env         *bootstrap.Env
}

// GetProfile 获取当前用户资料
func (uc *ProfileController) GetProfile(c *gin.Context) {
	userID := c.GetString(constants.UserID)
	user, err := uc.UserUsecase.GetByID(c, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("User not found"))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(user))
}

// UpdateProfile 更新当前用户资料
func (uc *ProfileController) UpdateProfile(c *gin.Context) {
	// 从 JWT token 中获取用户ID
	userID := c.GetString(constants.UserID)
	var updateData domain.ProfileUpdate

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	if err := uc.UserUsecase.UpdateProfile(c, userID, updateData); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Profile updated successfully"))
}

// UpdatePassword 更新当前用户密码
func (uc *ProfileController) UpdatePassword(c *gin.Context) {
	// 从 JWT token 中获取用户ID
	userID := c.GetString(constants.UserID)
	var passwordUpdate domain.PasswordUpdate

	if err := c.ShouldBindJSON(&passwordUpdate); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	if err := uc.UserUsecase.UpdatePassword(c, userID, passwordUpdate); err != nil {
		if err == domain.ErrInvalidPassword {
			c.JSON(http.StatusBadRequest, domain.RespError("Current password is incorrect"))
			return
		}
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Password updated successfully"))
}
