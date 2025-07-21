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
	if err := uc.UserUsecase.Update(c, &user); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(user))
}

// DeleteUser 删除用户
func (uc *UserController) DeleteUser(c *gin.Context) {
	id := c.Param("id")

	if err := uc.UserUsecase.Delete(c, id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("User deleted successfully"))
}

// GetUserProjects 获取用户项目
func (uc *UserController) GetUserProjects(c *gin.Context) {
	userID := c.Param("id")

	projects, err := uc.UserUsecase.GetUserProjects(c, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(projects))
}

// GetUserGroups 获取用户组
func (uc *UserController) GetUserGroups(c *gin.Context) {
	_ = c.Param("id") // userID - 待实现
	// TODO: 这里需要实现获取用户组的逻辑
	// 需要添加 UserGroup 相关的 domain, repository, usecase
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

	if err := uc.UserUsecase.AssignUserToProject(c, userID, request.ProjectID); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

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

	if err := uc.UserUsecase.UnassignUserFromProject(c, userID, projectID); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	response := map[string]interface{}{
		"user_id":    userID,
		"project_id": projectID,
		"message":    "User unassigned from project successfully",
	}
	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetProfile 获取当前用户资料
func (uc *UserController) GetProfile(c *gin.Context) {
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
	var updateData domain.ProfileUpdate

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	if err := uc.UserUsecase.UpdateProfile(c, userID, updateData); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	// 获取更新后的用户信息
	user, err := uc.UserUsecase.GetByID(c, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(user))
}
