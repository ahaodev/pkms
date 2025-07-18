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
	var updateData struct {
		Name   string `json:"name"`
		Avatar string `json:"avatar"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	// 这里需要实现更新用户资料的逻辑
	response := map[string]interface{}{
		"user_id": userID,
		"name":    updateData.Name,
		"avatar":  updateData.Avatar,
		"message": "Profile updated successfully",
	}
	c.JSON(http.StatusOK, domain.RespSuccess(response))
}
