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

// GetUsers godoc
// @Summary      Get all users
// @Description  Retrieve all users (admin only)
// @Tags         Users
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.Response{data=[]domain.User}  "Users retrieved successfully"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /user [get]
func (uc *UserController) GetUsers(c *gin.Context) {
	users, err := uc.UserUsecase.Fetch(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(users))
}

// CreateUser godoc
// @Summary      Create a new user
// @Description  Create a new user (admin only)
// @Tags         Users
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        user  body      domain.User  true  "User data"
// @Success      201   {object}  domain.Response{data=domain.User}  "User created successfully"
// @Failure      400   {object}  domain.Response  "Invalid request data"
// @Failure      500   {object}  domain.Response  "Internal server error"
// @Router       /user [post]
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

// GetUser godoc
// @Summary      Get user by ID
// @Description  Retrieve a specific user by ID
// @Tags         Users
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "User ID"
// @Success      200  {object}  domain.Response{data=domain.User}  "User retrieved successfully"
// @Failure      404  {object}  domain.Response  "User not found"
// @Router       /user/{id} [get]
func (uc *UserController) GetUser(c *gin.Context) {
	id := c.Param("id")
	user, err := uc.UserUsecase.GetByID(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("User not found"))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(user))
}

// UpdateUser godoc
// @Summary      Update user
// @Description  Update a specific user by ID (admin only)
// @Tags         Users
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path      string                  true  "User ID"
// @Param        user  body      domain.UserUpdateRequest  true  "Updated user data"
// @Success      200   {object}  domain.Response{data=domain.User}  "User updated successfully"
// @Failure      400   {object}  domain.Response  "Invalid request data"
// @Failure      500   {object}  domain.Response  "Internal server error"
// @Router       /user/{id} [put]
func (uc *UserController) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var updateReq domain.UserUpdateRequest
	if err := c.ShouldBindJSON(&updateReq); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	if err := uc.UserUsecase.UpdatePartial(c, id, updateReq); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	// 获取更新后的用户信息
	user, err := uc.UserUsecase.GetByID(c, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(user))
}

// DeleteUser godoc
// @Summary      Delete user
// @Description  Delete a specific user by ID (admin only)
// @Tags         Users
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "User ID"
// @Success      200  {object}  domain.Response{data=string}  "User deleted successfully"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /user/{id} [delete]
func (uc *UserController) DeleteUser(c *gin.Context) {
	id := c.Param("id")

	if err := uc.UserUsecase.Delete(c, id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("User deleted successfully"))
}

// GetProfile godoc
// @Summary      Get current user profile
// @Description  Retrieve the profile information of the currently authenticated user
// @Tags         Users
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.Response{data=domain.User}  "Profile retrieved successfully"
// @Failure      404  {object}  domain.Response  "User not found"
// @Router       /user/profile [get]
func (uc *UserController) GetProfile(c *gin.Context) {
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
// @Description  Update the profile information of the currently authenticated user
// @Tags         Users
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        profile  body      domain.ProfileUpdate  true  "Profile update data"
// @Success      200      {object}  domain.Response{data=domain.User}  "Profile updated successfully"
// @Failure      400      {object}  domain.Response  "Invalid request data"
// @Failure      500      {object}  domain.Response  "Internal server error"
// @Router       /user/profile [put]
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
