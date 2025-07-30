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

// GetProfile godoc
// @Summary      Get current user profile
// @Description  Get profile information for the currently authenticated user
// @Tags         Profile
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.Response{data=domain.User}  "Profile retrieved successfully"
// @Failure      404  {object}  domain.Response  "User not found"
// @Router       /profile [get]
func (uc *ProfileController) GetProfile(c *gin.Context) {
	userID := c.GetString(constants.UserID)
	user, err := uc.UserUsecase.GetByID(c, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("User not found"))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(user))
}

// UpdateProfile godoc
// @Summary      Update current user profile
// @Description  Update profile information for the currently authenticated user
// @Tags         Profile
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        profile  body      domain.ProfileUpdate  true  "Profile update data"
// @Success      200  {object}  domain.Response  "Profile updated successfully"
// @Failure      400  {object}  domain.Response  "Invalid request data"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /profile [put]
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

// UpdatePassword godoc
// @Summary      Update current user password
// @Description  Update password for the currently authenticated user
// @Tags         Profile
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        password  body      domain.PasswordUpdate  true  "Password update data"
// @Success      200  {object}  domain.Response  "Password updated successfully"
// @Failure      400  {object}  domain.Response  "Invalid request data or incorrect current password"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /profile/password [put]
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
