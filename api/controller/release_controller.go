package controller

import (
	"net/http"
	"pkms/internal/constants"
	"pkms/pkg"
	"sort"
	"strconv"
	"strings"

	"pkms/bootstrap"
	"pkms/domain"

	"github.com/gin-gonic/gin"
	"github.com/rs/xid"
)

type ReleaseController struct {
	ReleaseUsecase domain.ReleaseUsecase
	PackageUsecase domain.PackageUsecase
	FileUsecase    domain.FileUsecase
	ShareUsecase   domain.ShareUsecase
	Env            *bootstrap.Env
}

// compareVersions 比较两个版本号，返回 1 表示 v1 > v2，-1 表示 v1 < v2，0 表示 v1 = v2
func compareVersions(v1, v2 string) int {
	// 如果两个版本号相同，返回0
	if v1 == v2 {
		return 0
	}

	// 分割版本号
	parts1 := strings.Split(v1, ".")
	parts2 := strings.Split(v2, ".")

	// 获取最大长度
	maxLen := len(parts1)
	if len(parts2) > maxLen {
		maxLen = len(parts2)
	}

	// 逐个比较版本号的每一部分
	for i := 0; i < maxLen; i++ {
		var n1, n2 int
		var err1, err2 error

		// 获取第i部分的数值，如果不存在则为0
		if i < len(parts1) {
			n1, err1 = strconv.Atoi(parts1[i])
		}
		if i < len(parts2) {
			n2, err2 = strconv.Atoi(parts2[i])
		}

		// 如果解析失败，使用字符串比较
		if err1 != nil || err2 != nil {
			part1 := ""
			part2 := ""
			if i < len(parts1) {
				part1 = parts1[i]
			}
			if i < len(parts2) {
				part2 = parts2[i]
			}
			if part1 > part2 {
				return 1
			} else if part1 < part2 {
				return -1
			}
			continue
		}

		// 数值比较
		if n1 > n2 {
			return 1
		} else if n1 < n2 {
			return -1
		}
	}

	return 0
}

// GetReleases 获取包的所有发布版本
// @Summary      Get package releases
// @Description  Get all releases for a specific package with pagination
// @Tags         Releases
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        package_id   path     string  true   "Package ID"
// @Param        page         query    int     false  "Page number (default: 1)"
// @Param        pageSize     query    int     false  "Page size (default: 20)"
// @Success      200          {object} domain.Response  "Successfully retrieved releases"
// @Failure      400          {object} domain.Response  "Bad request - package_id is required"
// @Failure      404          {object} domain.Response  "Releases not found"
// @Router       /packages/{package_id}/releases [get]
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

	// 按版本号排序，优先使用 version_code，其次使用 version_name，版本号大的排在前面
	sort.Slice(releases, func(i, j int) bool {
		// 优先比较 version_code
		if releases[i].VersionCode != "" && releases[j].VersionCode != "" {
			return compareVersions(releases[i].VersionCode, releases[j].VersionCode) > 0
		}
		// 如果 version_code 为空，使用 version_name
		if releases[i].VersionName != "" && releases[j].VersionName != "" {
			return compareVersions(releases[i].VersionName, releases[j].VersionName) > 0
		}
		// 如果一个有 version_code 另一个没有，有的排在前面
		if releases[i].VersionCode != "" && releases[j].VersionCode == "" {
			return true
		}
		if releases[i].VersionCode == "" && releases[j].VersionCode != "" {
			return false
		}
		// 都没有版本号时，按创建时间倒序排列（新的在前面）
		return releases[i].CreatedAt.After(releases[j].CreatedAt)
	})

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
// @Summary      Get specific release
// @Description  Get a specific release by ID
// @Tags         Releases
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path     string  true  "Release ID"
// @Success      200  {object} domain.Response  "Successfully retrieved release"
// @Failure      404  {object} domain.Response  "Release not found"
// @Router       /releases/{id} [get]
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
// @Summary      Upload release
// @Description  Upload a new release file with metadata
// @Tags         Releases
// @Accept       multipart/form-data
// @Produce      json
// @Security     BearerAuth
// @Param        file          formData  file    true   "Release file"
// @Param        package_id    formData  string  true   "Package ID"
// @Param        name          formData  string  false  "Release name"
// @Param        version_code  formData  string  true   "Version code"
// @Param        version_name  formData  string  false  "Version name"
// @Param        type          formData  string  false  "Release type"
// @Param        changelog     formData  string  false  "Changelog"
// @Param        tag_name      formData  string  false  "Tag name"
// @Param        is_latest     formData  bool    false  "Is latest version"
// @Success      201           {object} domain.Response  "Successfully uploaded release"
// @Failure      400           {object} domain.Response  "Bad request - missing required fields or file upload failed"
// @Failure      500           {object} domain.Response  "Internal server error"
// @Router       /releases/upload [post]
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
		Version:    c.PostForm("version_code"),
		Type:       c.PostForm("type"),
		Changelog:  c.PostForm("changelog"),
		TagName:    c.PostForm("tag_name"),
		File:       file,
		FileName:   header.Filename,
		FileSize:   header.Size,
		FileHeader: header.Header.Get("Content-Type"),
	}

	// 验证必需字段
	if req.PackageID == "" || req.Version == "" {
		c.JSON(http.StatusBadRequest, domain.RespError("Missing required fields: package_id, version_code"))
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
		ID:          releaseID, // 使用预先生成的 ID
		PackageID:   req.PackageID,
		VersionCode: req.Version,
		TagName:     req.TagName,
		VersionName: c.PostForm("version_name"),
		ChangeLog:   req.Changelog,
		FileName:    req.FileName,
		FileSize:    req.FileSize,
		FilePath:    uploadResp.ObjectName,
		CreatedBy:   userID,
	}

	err = rc.ReleaseUsecase.CreateRelease(c, release)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("Create release failed: "+err.Error()))
		return
	}

	c.JSON(http.StatusCreated, domain.RespSuccess(release))
}

// DeleteRelease 删除发布版本
// @Summary      Delete release
// @Description  Delete a specific release by ID
// @Tags         Releases
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path     string  true  "Release ID"
// @Success      200  {object} domain.Response  "Successfully deleted release"
// @Failure      500  {object} domain.Response  "Delete release failed"
// @Router       /releases/{id} [delete]
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
// @Summary      Download release file
// @Description  Download the file associated with a specific release
// @Tags         Releases
// @Accept       json
// @Produce      application/octet-stream
// @Security     BearerAuth
// @Param        id   path     string  true  "Release ID"
// @Success      200  {file}   file    "Successfully downloaded release file"
// @Failure      404  {object} domain.Response  "Release not found"
// @Failure      500  {object} domain.Response  "Download failed"
// @Router       /releases/{id}/download [get]
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
// @Summary      Get latest release
// @Description  Get the latest release for a specific package
// @Tags         Releases
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        package_id   path     string  true  "Package ID"
// @Success      200          {object} domain.Response  "Successfully retrieved latest release"
// @Failure      404          {object} domain.Response  "Latest release not found"
// @Router       /packages/{package_id}/releases/latest [get]
func (rc *ReleaseController) GetLatestRelease(c *gin.Context) {
	packageID := c.Param("package_id")

	release, err := rc.ReleaseUsecase.GetLatestRelease(c, packageID)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("Latest release not found"))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(release))
}

// CreateShareLink 创建发布版本分享链接
// @Summary      Create share link
// @Description  Create a shareable link for a specific release
// @Tags         Releases
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path     string                    true  "Release ID"
// @Param        request  body     domain.CreateShareRequest true  "Share link request"
// @Success      200      {object} domain.Response          "Successfully created share link"
// @Failure      400      {object} domain.Response          "Bad request - invalid parameters"
// @Failure      500      {object} domain.Response          "Create share failed"
// @Router       /releases/{id}/share [post]
func (rc *ReleaseController) CreateShareLink(c *gin.Context) {
	releaseID := c.Param("id")
	var request domain.CreateShareRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	// Keep the original ExpiryHours value (including -1 for permanent)
	// The usecase layer will handle the logic properly

	request.ReleaseID = releaseID

	// Create share using usecase
	shareResponse, err := rc.ShareUsecase.CreateShare(c, &request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("Create share failed: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(shareResponse))
}
