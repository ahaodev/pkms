package controller

import (
	"net/http"
	"pkms/internal/constants"

	"pkms/bootstrap"
	"pkms/domain"

	"github.com/gin-gonic/gin"
)

type ProjectController struct {
	ProjectUsecase domain.ProjectUsecase
	Env            *bootstrap.Env
}

// GetProjects 获取所有项目
func (pc *ProjectController) GetProjects(c *gin.Context) {
	projects, err := pc.ProjectUsecase.Fetch(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(projects))
}

// CreateProject 创建项目
func (pc *ProjectController) CreateProject(c *gin.Context) {
	userId := c.GetString(constants.UserID)
	tenantID := c.GetHeader(constants.TenantID)
	var project domain.Project
	if err := c.ShouldBindJSON(&project); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}
	project.CreatedBy = userId
	project.TenantID = tenantID
	if err := pc.ProjectUsecase.Create(c, &project); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusCreated, domain.RespSuccess(project))
}

// GetProject 获取特定项目
func (pc *ProjectController) GetProject(c *gin.Context) {
	id := c.Param("id")
	project, err := pc.ProjectUsecase.GetByID(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("Project not found"))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(project))
}

// UpdateProject 更新项目
func (pc *ProjectController) UpdateProject(c *gin.Context) {
	id := c.Param("id")
	var project domain.Project
	if err := c.ShouldBindJSON(&project); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	project.ID = id
	if err := pc.ProjectUsecase.Update(c, &project); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(project))
}

// DeleteProject 删除项目
func (pc *ProjectController) DeleteProject(c *gin.Context) {
	id := c.Param("id")
	if err := pc.ProjectUsecase.Delete(c, id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess("Project deleted successfully"))
}

// GetProjectPackages 获取项目包列表
func (pc *ProjectController) GetProjectPackages(c *gin.Context) {
	_ = c.Param("id") // projectID - 待实现
	// 这里需要调用 PackageUsecase，暂时返回空数组
	c.JSON(http.StatusOK, domain.RespSuccess([]interface{}{}))
}

// GetProjectMembers 获取项目成员
func (pc *ProjectController) GetProjectMembers(c *gin.Context) {
	_ = c.Param("id") // projectID - 待实现
	// 这里需要实现获取项目成员的逻辑
	c.JSON(http.StatusOK, domain.RespSuccess([]interface{}{}))
}

// AddProjectMember 添加项目成员
func (pc *ProjectController) AddProjectMember(c *gin.Context) {
	_ = c.Param("id") // projectID - 待实现
	var request struct {
		UserID string `json:"user_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	// 这里需要实现添加项目成员的逻辑
	c.JSON(http.StatusOK, domain.RespSuccess("Member added successfully"))
}

// RemoveProjectMember 移除项目成员
func (pc *ProjectController) RemoveProjectMember(c *gin.Context) {
	_ = c.Param("id")     // projectID - 待实现
	_ = c.Param("userId") // userID - 待实现

	// 这里需要实现移除项目成员的逻辑
	c.JSON(http.StatusOK, domain.RespSuccess("Member removed successfully"))
}
