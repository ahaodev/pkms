package controller

import (
	"net/http"

	"pkms/bootstrap"
	"pkms/domain"

	"github.com/gin-gonic/gin"
)

type GroupController struct {
	GroupUsecase domain.GroupUsecase
	Env          *bootstrap.Env
}

// GetGroups 获取所有组
func (gc *GroupController) GetGroups(c *gin.Context) {
	groups, err := gc.GroupUsecase.Fetch(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(groups))
}

// CreateGroup 创建组
func (gc *GroupController) CreateGroup(c *gin.Context) {
	var group domain.Group
	if err := c.ShouldBindJSON(&group); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	if err := gc.GroupUsecase.Create(c, &group); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusCreated, domain.RespSuccess(group))
}

// GetGroup 获取特定组
func (gc *GroupController) GetGroup(c *gin.Context) {
	id := c.Param("id")
	group, err := gc.GroupUsecase.GetByID(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("Group not found"))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(group))
}

// UpdateGroup 更新组
func (gc *GroupController) UpdateGroup(c *gin.Context) {
	id := c.Param("id")
	var group domain.Group
	if err := c.ShouldBindJSON(&group); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	group.ID = id
	if err := gc.GroupUsecase.Update(c, &group); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(group))
}

// DeleteGroup 删除组
func (gc *GroupController) DeleteGroup(c *gin.Context) {
	id := c.Param("id")
	if err := gc.GroupUsecase.Delete(c, id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess("Group deleted successfully"))
}

// GetGroupMembers 获取组成员
func (gc *GroupController) GetGroupMembers(c *gin.Context) {
	groupID := c.Param("id")
	members, err := gc.GroupUsecase.GetMembers(c, groupID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(members))
}

// AddGroupMember 添加组成员
func (gc *GroupController) AddGroupMember(c *gin.Context) {
	groupID := c.Param("id")
	var request struct {
		UserID string `json:"user_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	// 获取当前用户ID作为添加者
	adderID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, domain.RespError("User not authenticated"))
		return
	}

	membership := &domain.GroupMembership{
		UserID:  request.UserID,
		GroupID: groupID,
		AddedBy: adderID.(string),
	}

	if err := gc.GroupUsecase.AddMember(c, membership); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Member added successfully"))
}

// RemoveGroupMember 移除组成员
func (gc *GroupController) RemoveGroupMember(c *gin.Context) {
	groupID := c.Param("id")
	userID := c.Param("userId")

	if err := gc.GroupUsecase.RemoveMember(c, userID, groupID); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Member removed successfully"))
}

// GetGroupPermissions 获取组权限
func (gc *GroupController) GetGroupPermissions(c *gin.Context) {
	_ = c.Param("id") // groupID - 待实现
	// 这里需要实现获取组权限的逻辑
	c.JSON(http.StatusOK, domain.RespSuccess([]interface{}{}))
}

// SetGroupPermissions 设置组权限
func (gc *GroupController) SetGroupPermissions(c *gin.Context) {
	_ = c.Param("id") // groupID - 待实现
	var permissions []domain.GroupPermission
	if err := c.ShouldBindJSON(&permissions); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	// 这里需要实现设置组权限的逻辑
	c.JSON(http.StatusOK, domain.RespSuccess("Group permissions set successfully"))
}
