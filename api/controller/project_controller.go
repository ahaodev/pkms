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

// GetProjects godoc
// @Summary      Get all projects
// @Description  Retrieve all projects for the current tenant
// @Tags         Projects
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id  header    string  true  "Tenant ID"
// @Success      200  {object}  domain.Response{data=[]domain.Project}  "Projects retrieved successfully"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /projects [get]
func (pc *ProjectController) GetProjects(c *gin.Context) {
	tenantID := c.GetHeader(constants.TenantID)
	projects, err := pc.ProjectUsecase.Fetch(c, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(projects))
}

// CreateProject godoc
// @Summary      Create a new project
// @Description  Create a new project for the current tenant
// @Tags         Projects
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id  header    string         true  "Tenant ID"
// @Param        project      body      domain.Project true  "Project data"
// @Success      201  {object}  domain.Response{data=domain.Project}  "Project created successfully"
// @Failure      400  {object}  domain.Response  "Invalid request data"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /projects [post]
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

// GetProject godoc
// @Summary      Get project by ID
// @Description  Retrieve a specific project by ID
// @Tags         Projects
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Project ID"
// @Success      200  {object}  domain.Response{data=domain.Project}  "Project retrieved successfully"
// @Failure      404  {object}  domain.Response  "Project not found"
// @Router       /projects/{id} [get]
func (pc *ProjectController) GetProject(c *gin.Context) {
	id := c.Param("id")
	project, err := pc.ProjectUsecase.GetByID(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("Project not found"))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(project))
}

// UpdateProject godoc
// @Summary      Update project
// @Description  Update a specific project by ID
// @Tags         Projects
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      string          true  "Project ID"
// @Param        project  body      domain.Project  true  "Updated project data"
// @Success      200      {object}  domain.Response{data=domain.Project}  "Project updated successfully"
// @Failure      400      {object}  domain.Response  "Invalid request data"
// @Failure      500      {object}  domain.Response  "Internal server error"
// @Router       /projects/{id} [put]
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

// DeleteProject godoc
// @Summary      Delete project
// @Description  Delete a specific project by ID
// @Tags         Projects
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Project ID"
// @Success      200  {object}  domain.Response{data=string}  "Project deleted successfully"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /projects/{id} [delete]
func (pc *ProjectController) DeleteProject(c *gin.Context) {
	id := c.Param("id")
	if err := pc.ProjectUsecase.Delete(c, id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess("Project deleted successfully"))
}

// GetProjectPackages godoc
// @Summary      Get project packages
// @Description  Retrieve all packages associated with a specific project
// @Tags         Projects
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Project ID"
// @Success      200  {object}  domain.Response{data=[]interface{}}  "Project packages retrieved successfully"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /projects/{id}/packages [get]
func (pc *ProjectController) GetProjectPackages(c *gin.Context) {
	_ = c.Param("id") // projectID - 待实现
	// 这里需要调用 PackageUsecase，暂时返回空数组
	c.JSON(http.StatusOK, domain.RespSuccess([]interface{}{}))
}

// GetProjectMembers godoc
// @Summary      Get project members
// @Description  Retrieve all members associated with a specific project
// @Tags         Projects
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Project ID"
// @Success      200  {object}  domain.Response{data=[]interface{}}  "Project members retrieved successfully"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /projects/{id}/members [get]
func (pc *ProjectController) GetProjectMembers(c *gin.Context) {
	_ = c.Param("id") // projectID - 待实现
	// 这里需要实现获取项目成员的逻辑
	c.JSON(http.StatusOK, domain.RespSuccess([]interface{}{}))
}

// AddProjectMember godoc
// @Summary      Add project member
// @Description  Add a user as a member to a specific project
// @Tags         Projects
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      string  true   "Project ID"
// @Param        request  body      object  true   "Member assignment data"
// @Success      200      {object}  domain.Response{data=string}  "Member added successfully"
// @Failure      400      {object}  domain.Response  "Invalid request data"
// @Failure      500      {object}  domain.Response  "Internal server error"
// @Router       /projects/{id}/members [post]
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

// RemoveProjectMember godoc
// @Summary      Remove project member
// @Description  Remove a user from a specific project
// @Tags         Projects
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id      path      string  true  "Project ID"
// @Param        userId  path      string  true  "User ID"
// @Success      200     {object}  domain.Response{data=string}  "Member removed successfully"
// @Failure      500     {object}  domain.Response  "Internal server error"
// @Router       /projects/{id}/members/{userId} [delete]
func (pc *ProjectController) RemoveProjectMember(c *gin.Context) {
	_ = c.Param("id")     // projectID - 待实现
	_ = c.Param("userId") // userID - 待实现

	// 这里需要实现移除项目成员的逻辑
	c.JSON(http.StatusOK, domain.RespSuccess("Member removed successfully"))
}
