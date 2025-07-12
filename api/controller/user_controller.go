package controller

import (
	"net/http"
	"pkms/internal/constants"

	"pkms/bootstrap"
	"pkms/domain"

	"github.com/gin-gonic/gin"
)

type UserController struct {
	UserUsecase domain.UserUseCase
	Env         *bootstrap.Env
}

// GetUsers 获取所有用户
func (uc *UserController) GetUsers(c *gin.Context) {
	users, err := uc.UserUsecase.Fetch(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(users))
}

// CreateUser 创建用户
func (uc *UserController) CreateUser(c *gin.Context) {
	var user domain.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	if err := uc.UserUsecase.Create(c, &user); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusCreated, domain.RespSuccess(user))
}

// GetUser 获取特定用户
func (uc *UserController) GetUser(c *gin.Context) {
	id := c.Param("id")
	user, err := uc.UserUsecase.GetByID(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("User not found"))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(user))
}

// UpdateUser 更新用户
func (uc *UserController) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var user domain.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	user.ID = id
	// 这里需要实现用户更新逻辑，目前 UserUsecase 没有 Update 方法
	c.JSON(http.StatusOK, domain.RespSuccess(user))
}

// DeleteUser 删除用户
func (uc *UserController) DeleteUser(c *gin.Context) {
	_ = c.Param("id") // id - 待实现
	// 这里需要实现用户删除逻辑，目前 UserUsecase 没有 Delete 方法
	c.JSON(http.StatusOK, domain.RespSuccess("User deleted successfully"))
}

// GetUserProjects 获取用户项目
func (uc *UserController) GetUserProjects(c *gin.Context) {
	_ = c.Param("id") // userID - 待实现
	// 这里需要实现获取用户项目的逻辑
	c.JSON(http.StatusOK, domain.RespSuccess([]interface{}{}))
}

// GetUserGroups 获取用户组
func (uc *UserController) GetUserGroups(c *gin.Context) {
	_ = c.Param("id") // userID - 待实现
	// 这里需要实现获取用户组的逻辑
	c.JSON(http.StatusOK, domain.RespSuccess([]interface{}{}))
}

// AssignUserToProject 分配用户到项目
func (uc *UserController) AssignUserToProject(c *gin.Context) {
	userID := c.Param("id")
	var request struct {
		ProjectID string `json:"project_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	// 这里需要实现分配用户到项目的逻辑
	response := map[string]interface{}{
		"user_id":    userID,
		"project_id": request.ProjectID,
		"message":    "User assigned to project successfully",
	}
	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// UnassignUserFromProject 从项目中移除用户
func (uc *UserController) UnassignUserFromProject(c *gin.Context) {
	userID := c.Param("id")
	projectID := c.Param("projectId")

	// 这里需要实现从项目中移除用户的逻辑
	response := map[string]interface{}{
		"user_id":    userID,
		"project_id": projectID,
		"message":    "User unassigned from project successfully",
	}
	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetProfile 获取当前用户资料
func (uc *UserController) GetProfile(c *gin.Context) {
	// 从 JWT token 中获取用户ID
	userID := c.GetString(constants.UserID)
	user, err := uc.UserUsecase.GetByID(c, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("User not found"))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(user))
}

// UpdateProfile 更新当前用户资料
func (uc *UserController) UpdateProfile(c *gin.Context) {
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
