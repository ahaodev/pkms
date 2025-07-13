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

	if projectID == "" {
		c.JSON(http.StatusOK, domain.RespPageSuccess([]*domain.Package{}, 0, page, pageSize))
		return
	}

	packages, total, err := pc.PackageUsecase.GetPackagesByProject(c, projectID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespPageSuccess(packages, total, page, pageSize))
}

// CreatePackage 创建包
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
func (pc *PackageController) DeletePackage(c *gin.Context) {
	id := c.Param("id")
	if err := pc.PackageUsecase.DeletePackage(c, id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess("Package deleted successfully"))
}

// UploadRelease 上传包
func (pc *PackageController) UploadRelease(c *gin.Context) {
	userID := c.GetString(constants.UserID)
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
	// 调用usecase进行发布版本创建
	// 首先需要确保包存在或创建包
	release := &domain.Release{
		PackageID:    req.PackageID,
		Version:      req.Version,
		TagName:      req.TagName,
		Title:        req.Title,
		Description:  req.Changelog,
		FileName:     req.FileName,
		FileSize:     req.FileSize,
		IsPrerelease: req.IsPrerelease,
		IsLatest:     req.IsLatest,
		IsDraft:      req.IsDraft,
		CreatedBy:    userID,
	}

	err = pc.PackageUsecase.CreateRelease(c, release)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("Create release failed: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(release))
}

// DownloadPackage 下载包的最新版本
func (pc *PackageController) DownloadPackage(c *gin.Context) {
	id := c.Param("id")

	// 获取包的最新发布版本
	latestRelease, err := pc.PackageUsecase.GetLatestRelease(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("Latest release not found"))
		return
	}

	// 增加下载计数
	err = pc.PackageUsecase.IncrementDownloadCount(c, latestRelease.ID)
	if err != nil {
		// 记录错误但不阻止下载
		// log.Error("Failed to increment download count:", err)
	}

	// 提供下载链接（实际实现可能需要根据文件存储方式调整）
	c.JSON(http.StatusOK, domain.RespSuccess(map[string]interface{}{
		"download_url": latestRelease.FilePath,
		"filename":     latestRelease.FileName,
		"size":         latestRelease.FileSize,
		"version":      latestRelease.Version,
		"checksum":     latestRelease.FileHash,
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
		ExpiryHours int `json:"expiry_hours"`
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
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetProjectPackages 获取项目的所有包
func (pc *PackageController) GetProjectPackages(c *gin.Context) {
	projectID := c.Param("projectId")
	packages, _, err := pc.PackageUsecase.GetPackagesByProject(c, projectID, 1, 1000) // 获取所有包
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(packages))
}
