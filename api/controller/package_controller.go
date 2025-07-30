package controller

import (
	"net/http"
	"pkms/internal/constants"
	"strconv"

	"pkms/bootstrap"
	"pkms/domain"

	"github.com/gin-gonic/gin"
)

type PackageController struct {
	PackageUsecase domain.PackageUsecase
	Env            *bootstrap.Env
}

// GetPackages 获取所有包
// @Summary      Get all packages
// @Description  Get all packages with pagination and optional project filtering
// @Tags         Packages
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id  header  string  true   "Tenant ID"
// @Param        page         query   int     false  "Page number (default: 1)"
// @Param        pageSize     query   int     false  "Page size (default: 20)"
// @Param        project_id   query   string  false  "Filter by project ID"
// @Success      200  {object}  domain.Response{data=[]domain.Package}  "Successfully retrieved packages"
// @Failure      400  {object}  domain.Response  "Invalid request parameters"
// @Failure      401  {object}  domain.Response  "Unauthorized"
// @Failure      403  {object}  domain.Response  "Forbidden"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /packages [get]
func (pc *PackageController) GetPackages(c *gin.Context) {
	// 解析分页参数
	page := 1
	pageSize := 20
	projectID := c.Query("project_id")

	if p := c.Query("page"); p != "" {
		if v, err := strconv.Atoi(p); err == nil {
			page = v
		}
	}
	if ps := c.Query("pageSize"); ps != "" {
		if v, err := strconv.Atoi(ps); err == nil {
			pageSize = v
		}
	}

	// 如果没有project_id，查询所有有权限的包
	var packages []*domain.Package
	var total int
	var err error

	if projectID == "" {
		// 获取所有软件包（后续可以根据权限过滤）
		packages, total, err = pc.PackageUsecase.GetAllPackages(c, page, pageSize)
	} else {
		packages, total, err = pc.PackageUsecase.GetPackagesByProject(c, projectID, page, pageSize)
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespPageSuccess(packages, total, page, pageSize))
}

// CreatePackage 创建包
// @Summary      Create a new package
// @Description  Create a new package with provided details
// @Tags         Packages
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id  header  string         true  "Tenant ID"
// @Param        package      body    domain.Package true  "Package details"
// @Success      201  {object}  domain.Response{data=domain.Package}  "Successfully created package"
// @Failure      400  {object}  domain.Response  "Invalid request body"
// @Failure      401  {object}  domain.Response  "Unauthorized"
// @Failure      403  {object}  domain.Response  "Forbidden"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /packages [post]
func (pc *PackageController) CreatePackage(c *gin.Context) {
	var pkg domain.Package
	if err := c.ShouldBindJSON(&pkg); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}
	pkg.CreatedBy = c.GetString(constants.UserID)
	if err := pc.PackageUsecase.CreatePackage(c, &pkg); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusCreated, domain.RespSuccess(pkg))
}

// GetPackage 获取特定包
// @Summary      Get package by ID
// @Description  Get a specific package by its ID
// @Tags         Packages
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id  header  string  true  "Tenant ID"
// @Param        id           path    string  true  "Package ID"
// @Success      200  {object}  domain.Response{data=domain.Package}  "Successfully retrieved package"
// @Failure      400  {object}  domain.Response  "Invalid package ID"
// @Failure      401  {object}  domain.Response  "Unauthorized"
// @Failure      403  {object}  domain.Response  "Forbidden"
// @Failure      404  {object}  domain.Response  "Package not found"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /packages/{id} [get]
func (pc *PackageController) GetPackage(c *gin.Context) {
	id := c.Param("id")
	pkg, err := pc.PackageUsecase.GetPackageByID(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("Package not found"))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(pkg))
}

// DeletePackage 删除包
// @Summary      Delete package by ID
// @Description  Delete a specific package by its ID
// @Tags         Packages
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id  header  string  true  "Tenant ID"
// @Param        id           path    string  true  "Package ID"
// @Success      200  {object}  domain.Response{data=string}  "Package deleted successfully"
// @Failure      400  {object}  domain.Response  "Invalid package ID"
// @Failure      401  {object}  domain.Response  "Unauthorized"
// @Failure      403  {object}  domain.Response  "Forbidden"
// @Failure      404  {object}  domain.Response  "Package not found"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /packages/{id} [delete]
func (pc *PackageController) DeletePackage(c *gin.Context) {
	id := c.Param("id")
	if err := pc.PackageUsecase.DeletePackage(c, id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess("Package deleted successfully"))
}

// UpdatePackage 更新包信息
// @Summary      Update package by ID
// @Description  Update a specific package with new details
// @Tags         Packages
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id  header  string         true  "Tenant ID"
// @Param        id           path    string         true  "Package ID"
// @Param        package      body    domain.Package true  "Updated package details"
// @Success      200  {object}  domain.Response{data=string}  "Package updated successfully"
// @Failure      400  {object}  domain.Response  "Invalid request body or package ID"
// @Failure      401  {object}  domain.Response  "Unauthorized"
// @Failure      403  {object}  domain.Response  "Forbidden"
// @Failure      404  {object}  domain.Response  "Package not found"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /packages/{id} [put]
func (pc *PackageController) UpdatePackage(c *gin.Context) {
	id := c.Param("id")
	var pkg domain.Package

	if err := c.ShouldBindJSON(&pkg); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	pkg.ID = id
	if err := pc.PackageUsecase.UpdatePackage(c, &pkg); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Package updated successfully"))
}

// GetProjectPackages 获取项目的所有包
// @Summary      Get all packages for a project
// @Description  Get all packages belonging to a specific project
// @Tags         Packages
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id  header  string  true  "Tenant ID"
// @Param        projectId    path    string  true  "Project ID"
// @Success      200  {object}  domain.Response{data=[]domain.Package}  "Successfully retrieved project packages"
// @Failure      400  {object}  domain.Response  "Invalid project ID"
// @Failure      401  {object}  domain.Response  "Unauthorized"
// @Failure      403  {object}  domain.Response  "Forbidden"
// @Failure      404  {object}  domain.Response  "Project not found"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /projects/{projectId}/packages [get]
func (pc *PackageController) GetProjectPackages(c *gin.Context) {
	projectID := c.Param("projectId")
	packages, _, err := pc.PackageUsecase.GetPackagesByProject(c, projectID, 1, 1000) // 获取所有包
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(packages))
}
