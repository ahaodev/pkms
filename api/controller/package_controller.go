package controller

import (
	"net/http"

	"pkms/bootstrap"
	"pkms/domain"

	"github.com/gin-gonic/gin"
)

type PackageController struct {
	PackageUsecase domain.PackageUsecase
	Env            *bootstrap.Env
}

// GetPackages 获取所有包
func (pc *PackageController) GetPackages(c *gin.Context) {
	packages, err := pc.PackageUsecase.Fetch(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(packages))
}

// CreatePackage 创建包
func (pc *PackageController) CreatePackage(c *gin.Context) {
	var pkg domain.Package
	if err := c.ShouldBindJSON(&pkg); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	if err := pc.PackageUsecase.Create(c, &pkg); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusCreated, domain.RespSuccess(pkg))
}

// GetPackage 获取特定包
func (pc *PackageController) GetPackage(c *gin.Context) {
	id := c.Param("id")
	pkg, err := pc.PackageUsecase.GetByID(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("Package not found"))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(pkg))
}

// DeletePackage 删除包
func (pc *PackageController) DeletePackage(c *gin.Context) {
	id := c.Param("id")
	if err := pc.PackageUsecase.Delete(c, id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess("Package deleted successfully"))
}

// UploadPackage 上传包
func (pc *PackageController) UploadPackage(c *gin.Context) {
	// 获取上传的文件
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("File upload failed: "+err.Error()))
		return
	}
	defer file.Close()

	// 构建上传请求
	req := &domain.PackageUploadRequest{
		ProjectID:   c.PostForm("project_id"),
		Name:        c.PostForm("name"),
		Description: c.PostForm("description"),
		Version:     c.PostForm("version"),
		Type:        c.PostForm("type"),
		Changelog:   c.PostForm("changelog"),
		File:        file,
		FileName:    header.Filename,
		FileSize:    header.Size,
		FileHeader:  header.Header.Get("Content-Type"),
	}

	// 验证必需字段
	if req.ProjectID == "" || req.Name == "" || req.Version == "" {
		c.JSON(http.StatusBadRequest, domain.RespError("Missing required fields: project_id, name, version"))
		return
	}

	// 解析可选的布尔和数字字段
	if isLatest := c.PostForm("is_latest"); isLatest == "true" {
		req.IsLatest = true
	}
	if isPublic := c.PostForm("is_public"); isPublic == "true" {
		req.IsPublic = true
	}

	// 调用usecase进行文件上传和包创建
	result, err := pc.PackageUsecase.UploadPackage(c, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("Upload failed: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(result))
}

// DownloadPackage 下载包
func (pc *PackageController) DownloadPackage(c *gin.Context) {
	id := c.Param("id")
	pkg, err := pc.PackageUsecase.GetByID(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("Package not found"))
		return
	}

	// 增加下载计数
	pkg.DownloadCount++
	pc.PackageUsecase.Update(c, &pkg)

	// 提供下载链接（实际实现可能需要根据文件存储方式调整）
	c.JSON(http.StatusOK, domain.RespSuccess(map[string]interface{}{
		"download_url": pkg.FileURL,
		"filename":     pkg.FileName,
		"size":         pkg.FileSize,
		"version":      pkg.Version,
		"checksum":     pkg.Checksum,
	}))
}

// GetPackageVersions 获取包版本历史
func (pc *PackageController) GetPackageVersions(c *gin.Context) {
	_ = c.Param("id") // packageID - 待实现
	// 这里需要实现获取包版本历史的逻辑
	c.JSON(http.StatusOK, domain.RespSuccess([]interface{}{}))
}

// CreateShareLink 创建分享链接
func (pc *PackageController) CreateShareLink(c *gin.Context) {
	id := c.Param("id")
	var request struct {
		ExpiryHours int  `json:"expiry_hours"`
		IsPublic    bool `json:"is_public"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	// 这里需要实现创建分享链接的逻辑
	response := map[string]interface{}{
		"package_id":   id,
		"share_token":  "generated_token_here",
		"share_url":    "/api/v1/packages/share/generated_token_here",
		"expiry_hours": request.ExpiryHours,
		"is_public":    request.IsPublic,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetSharedPackage 通过分享链接获取包
func (pc *PackageController) GetSharedPackage(c *gin.Context) {
	token := c.Param("token")
	pkg, err := pc.PackageUsecase.GetByShareToken(c, token)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("Shared package not found or expired"))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(pkg))
}

// GetProjectPackages 获取项目的所有包
func (pc *PackageController) GetProjectPackages(c *gin.Context) {
	projectID := c.Param("projectId")
	packages, err := pc.PackageUsecase.GetByProjectID(c, projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(packages))
}
