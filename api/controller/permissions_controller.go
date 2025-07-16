package controller

import (
	"net/http"
	"pkms/internal/constants"

	"pkms/bootstrap"
	"pkms/domain"

	"github.com/gin-gonic/gin"
)

type PermissionsController struct {
	PermissionUsecase domain.PermissionUsecase
	Env               *bootstrap.Env
}

// GetUserPermissions 获取用户权限
func (pc *PermissionsController) GetUserPermissions(c *gin.Context) {
	userID := c.GetString(constants.UserID)
	permissions, err := pc.PermissionUsecase.GetUserPermissions(c, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(permissions))
}

// SetUserPermissions 设置用户权限
func (pc *PermissionsController) SetUserPermissions(c *gin.Context) {
	userID := c.Param("userId")
	var permission domain.Permission
	if err := c.ShouldBindJSON(&permission); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	permission.UserID = userID
	if err := pc.PermissionUsecase.CreateUserPermission(c, &permission); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("User permissions set successfully"))
}

// RemoveUserPermission 移除用户权限
func (pc *PermissionsController) RemoveUserPermission(c *gin.Context) {
	userID := c.Param("userId")
	projectID := c.Param("projectId")

	if err := pc.PermissionUsecase.DeleteUserPermission(c, userID, projectID); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("User permission removed successfully"))
}

// GetGroupPermissions 获取组权限
func (pc *PermissionsController) GetGroupPermissions(c *gin.Context) {
	groupID := c.Param("groupId")
	permissions, err := pc.PermissionUsecase.GetGroupPermissions(c, groupID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(permissions))
}

// SetGroupPermissions 设置组权限
func (pc *PermissionsController) SetGroupPermissions(c *gin.Context) {
	groupID := c.Param("groupId")
	var permission domain.GroupPermission
	if err := c.ShouldBindJSON(&permission); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	permission.GroupID = groupID
	if err := pc.PermissionUsecase.CreateGroupPermission(c, &permission); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Group permissions set successfully"))
}

// RemoveGroupPermission 移除组权限
func (pc *PermissionsController) RemoveGroupPermission(c *gin.Context) {
	groupID := c.Param("groupId")
	projectID := c.Param("projectId")

	if err := pc.PermissionUsecase.DeleteGroupPermission(c, groupID, projectID); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Group permission removed successfully"))
}

// GetProjectPermissions 获取项目权限
func (pc *PermissionsController) GetProjectPermissions(c *gin.Context) {
	projectID := c.Param("projectId")
	permissions, err := pc.PermissionUsecase.GetProjectPermissions(c, projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(permissions))
}

// CheckPermission 检查权限
func (pc *PermissionsController) CheckPermission(c *gin.Context) {
	var request struct {
		UserID    string `json:"user_id" binding:"required"`
		ProjectID string `json:"project_id" binding:"required"`
		Action    string `json:"action" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	hasPermission, err := pc.PermissionUsecase.HasPermission(c, request.UserID, request.ProjectID, request.Action)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	response := map[string]interface{}{
		"user_id":        request.UserID,
		"project_id":     request.ProjectID,
		"action":         request.Action,
		"has_permission": hasPermission,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}
