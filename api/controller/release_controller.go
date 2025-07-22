package controller

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"pkms/internal/constants"
	"pkms/pkg"
	"strconv"

	"pkms/bootstrap"
	"pkms/domain"

	"github.com/gin-gonic/gin"
	"github.com/rs/xid"
)

type ReleaseController struct {
	ReleaseUsecase domain.ReleaseUsecase
	PackageUsecase domain.PackageUsecase
	FileUsecase    domain.FileUsecase
	Env            *bootstrap.Env
}

// generateShareToken generates a random share token
func generateShareToken() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

// GetReleases 获取包的所有发布版本
func (rc *ReleaseController) GetReleases(c *gin.Context) {
	packageID := c.Param("package_id")
	if packageID == "" {
		packageID = c.Query("package_id")
	}

	if packageID == "" {
		c.JSON(http.StatusBadRequest, domain.RespError("package_id is required"))
		return
	}

	// 解析分页参数
	page := 1
	pageSize := 20
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

	releases, err := rc.ReleaseUsecase.GetReleasesByPackage(c, packageID)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("Releases not found"))
		return
	}

	// Apply pagination manually since the usecase doesn't support it
	total := len(releases)
	start := (page - 1) * pageSize
	end := start + pageSize

	if start > total {
		releases = []*domain.Release{}
	} else {
		if end > total {
			end = total
		}
		releases = releases[start:end]
	}

	c.JSON(http.StatusOK, domain.RespPageSuccess(releases, total, page, pageSize))
}

// GetRelease 获取特定发布版本
func (rc *ReleaseController) GetRelease(c *gin.Context) {
	releaseID := c.Param("id")
	release, err := rc.ReleaseUsecase.GetReleaseByID(c, releaseID)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("Release not found"))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(release))
}

// UploadRelease 上传发布版本
func (rc *ReleaseController) UploadRelease(c *gin.Context) {
	userID := c.GetString(constants.UserID)

	// 获取上传的文件
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("File upload failed: "+err.Error()))
		return
	}
	defer file.Close()

	// 构建上传请求
	req := &domain.ReleaseUploadRequest{
		PackageID:  c.PostForm("package_id"),
		Name:       c.PostForm("name"),
		Version:    c.PostForm("version"),
		Type:       c.PostForm("type"),
		Changelog:  c.PostForm("changelog"),
		TagName:    c.PostForm("tag_name"),
		Title:      c.PostForm("title"),
		File:       file,
		FileName:   header.Filename,
		FileSize:   header.Size,
		FileHeader: header.Header.Get("Content-Type"),
	}

	// 验证必需字段
	if req.PackageID == "" || req.Name == "" || req.Version == "" {
		c.JSON(http.StatusBadRequest, domain.RespError("Missing required fields: package_id, name, version"))
		return
	}

	// 获取包信息以获取 project_id
	packageInfo, err := rc.PackageUsecase.GetPackageByID(c, req.PackageID)
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("Package not found: "+err.Error()))
		return
	}

	// 解析可选的布尔字段
	if isLatest := c.PostForm("is_latest"); isLatest == "true" {
		req.IsLatest = true
	}
	if isPrerelease := c.PostForm("is_prerelease"); isPrerelease == "true" {
		req.IsPrerelease = true
	}
	if isDraft := c.PostForm("is_draft"); isDraft == "true" {
		req.IsDraft = true
	}

	// 生成 release ID (在文件上传前生成，确保目录结构一致)
	releaseID := xid.New().String()

	// 构建层次化的目录结构: {project_id}/{package_id}/{release_id}/{filename}
	// 这样可以确保即使文件名相同也不会冲突，并且便于按层级管理和追溯
	hierarchicalPrefix := packageInfo.ProjectID + "/" + req.PackageID + "/" + releaseID

	// 上传文件到存储
	uploadRequest := &domain.UploadRequest{
		Bucket:      rc.Env.S3Bucket,
		ObjectName:  header.Filename,
		Prefix:      hierarchicalPrefix,
		Reader:      file,
		Size:        header.Size,
		ContentType: header.Header.Get("Content-Type"),
	}
	uploadResp, err := rc.FileUsecase.Upload(c, uploadRequest)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("File upload failed: "+err.Error()))
		return
	}
	pkg.Log.Printf("文件上传成功: %s -> %s", header.Filename, uploadResp.ObjectName)

	// 创建发布版本，使用预先生成的 release ID 确保与文件路径一致
	release := &domain.Release{
		ID:           releaseID, // 使用预先生成的 ID
		PackageID:    req.PackageID,
		Version:      req.Version,
		TagName:      req.TagName,
		Title:        req.Title,
		ChangeLog:    req.Changelog,
		FileName:     req.FileName,
		FileSize:     req.FileSize,
		FilePath:     uploadResp.ObjectName,
		IsPrerelease: req.IsPrerelease,
		IsLatest:     req.IsLatest,
		IsDraft:      req.IsDraft,
		CreatedBy:    userID,
	}

	err = rc.ReleaseUsecase.CreateRelease(c, release)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("Create release failed: "+err.Error()))
		return
	}

	c.JSON(http.StatusCreated, domain.RespSuccess(release))
}

// UpdateRelease 更新发布版本信息
func (rc *ReleaseController) UpdateRelease(c *gin.Context) {
	releaseID := c.Param("id")
	var updateReq domain.Release

	if err := c.ShouldBindJSON(&updateReq); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	updateReq.ID = releaseID
	err := rc.ReleaseUsecase.UpdateRelease(c, &updateReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("Update release failed: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Release updated successfully"))
}

// DeleteRelease 删除发布版本
func (rc *ReleaseController) DeleteRelease(c *gin.Context) {
	releaseID := c.Param("id")
	err := rc.ReleaseUsecase.DeleteRelease(c, releaseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("Delete release failed: "+err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess("Release deleted successfully"))
}

// DownloadRelease 下载发布版本文件
func (rc *ReleaseController) DownloadRelease(c *gin.Context) {
	releaseID := c.Param("id")

	release, err := rc.ReleaseUsecase.GetReleaseByID(c, releaseID)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("Release not found"))
		return
	}

	// 增加下载计数
	err = rc.ReleaseUsecase.IncrementDownloadCount(c, releaseID)
	if err != nil {
		// 记录错误但不阻止下载
		pkg.Log.Error("Failed to increment download count:", err)
	}

	// 构建下载请求
	downloadRequest := &domain.DownloadRequest{
		Bucket:     rc.Env.S3Bucket,
		ObjectName: release.FilePath,
	}

	reader, err := rc.FileUsecase.Download(c, downloadRequest)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("Download failed: "+err.Error()))
		return
	}
	defer reader.Close()

	// 设置响应头
	c.Header("Content-Disposition", "attachment; filename="+release.FileName)
	c.Header("Content-Type", "application/octet-stream")
	c.Header("Content-Length", strconv.FormatInt(release.FileSize, 10))

	// 流式传输文件
	c.DataFromReader(http.StatusOK, release.FileSize, "application/octet-stream", reader, map[string]string{
		"Content-Disposition": "attachment; filename=" + release.FileName,
	})
}

// GetLatestRelease 获取包的最新发布版本
func (rc *ReleaseController) GetLatestRelease(c *gin.Context) {
	packageID := c.Param("package_id")

	release, err := rc.ReleaseUsecase.GetLatestRelease(c, packageID)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("Latest release not found"))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(release))
}

// SetLatestRelease 设置最新发布版本
func (rc *ReleaseController) SetLatestRelease(c *gin.Context) {
	releaseID := c.Param("id")

	// First get the release to find its package ID
	release, err := rc.ReleaseUsecase.GetReleaseByID(c, releaseID)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("Release not found"))
		return
	}

	err = rc.ReleaseUsecase.SetAsLatest(c, release.PackageID, releaseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("Set latest release failed: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Latest release updated successfully"))
}

// CreateShareLink 创建发布版本分享链接
func (rc *ReleaseController) CreateShareLink(c *gin.Context) {
	releaseID := c.Param("id")
	var request struct {
		ExpiryHours int `json:"expiry_hours"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	// 验证发布版本是否存在
	release, err := rc.ReleaseUsecase.GetReleaseByID(c, releaseID)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("Release not found"))
		return
	}

	// 创建分享链接（这里需要实现具体的分享逻辑）
	shareToken := generateShareToken()
	expiryHours := request.ExpiryHours
	if expiryHours <= 0 {
		expiryHours = 24 // 默认24小时
	}

	// 这里应该保存分享信息到数据库
	// TODO: 实现分享链接的创建和存储逻辑

	response := map[string]interface{}{
		"release_id":   releaseID,
		"share_token":  shareToken,
		"share_url":    "/api/v1/releases/share/" + shareToken,
		"expiry_hours": expiryHours,
		"file_name":    release.FileName,
		"version":      release.Version,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetSharedRelease 通过分享令牌获取发布版本
func (rc *ReleaseController) GetSharedRelease(c *gin.Context) {
	token := c.Param("token")
	pkg.Log.Println(token)
	// TODO: 实现通过分享令牌获取发布版本的逻辑
	// 1. 验证令牌有效性和过期时间
	// 2. 获取对应的发布版本信息
	// 3. 返回发布版本信息（不包含敏感信息）

	c.JSON(http.StatusNotImplemented, domain.RespError("Shared release feature not implemented yet"))
}

// DownloadSharedRelease 通过分享令牌下载发布版本文件
func (rc *ReleaseController) DownloadSharedRelease(c *gin.Context) {
	token := c.Param("token")
	pkg.Log.Println(token)
	// TODO: 实现通过分享令牌下载文件的逻辑
	// 1. 验证令牌有效性和过期时间
	// 2. 获取对应的发布版本信息
	// 3. 提供文件下载（可能需要增加下载计数）

	c.JSON(http.StatusNotImplemented, domain.RespError("Shared download feature not implemented yet"))
}
