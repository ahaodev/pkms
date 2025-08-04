package controller

import (
	"github.com/gin-gonic/gin"
	"io"
	"net/http"
	"pkms/bootstrap"
	"pkms/domain"
	"pkms/internal/constants"
	"strconv"
	"time"
)

// ClientAccessController 管理通过access token 接入该系统的凭证管理
type ClientAccessController struct {
	ClientAccessUsecase domain.ClientAccessUsecase
	UpgradeUsecase      domain.UpgradeUsecase
	FileUsecase         domain.FileUsecase
	ReleaseUsecase      domain.ReleaseUsecase
	Env                 *bootstrap.Env
}

// CheckUpdate godoc
// @Summary      Check for updates
// @Description  Check for application updates using client access token (no JWT required)
// @Tags         Client Access
// @Accept       json
// @Produce      json
// @Param        access-token  header    string                     true  "Client access token"
// @Param        request       body      domain.CheckUpdateRequest  true  "Update check request"
// @Success      200  {object}  domain.Response{data=domain.CheckUpdateResponse}  "Update check completed"
// @Failure      400  {object}  domain.Response  "Invalid request data"
// @Failure      401  {object}  domain.Response  "Invalid access token"
// @Failure      403  {object}  domain.Response  "Access token disabled or expired"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /client-access/check-update [post]
func (cac *ClientAccessController) CheckUpdate(c *gin.Context) {
	clientIP := c.ClientIP()
	accessToken := c.GetHeader(constants.AccessToken)
	var request domain.CheckUpdateRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	// 验证 access_token
	clientAccess, err := cac.ClientAccessUsecase.ValidateAccessToken(c, accessToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.RespError("无效的访问令牌"))
		return
	}

	// 检查凭证是否激活
	if !clientAccess.IsActive {
		c.JSON(http.StatusForbidden, domain.RespError("客户端接入凭证已被禁用"))
		return
	}

	// 检查是否过期
	if clientAccess.ExpiresAt != nil && clientAccess.ExpiresAt.Before(time.Now()) {
		c.JSON(http.StatusForbidden, domain.RespError("客户端接入凭证已过期"))
		return
	}

	// 调用升级检查业务逻辑
	response, err := cac.UpgradeUsecase.CheckUpdateByToken(c, &request, clientIP, accessToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// Download godoc
// @Summary      Download release file
// @Description  Download release file using client access token (no JWT required)
// @Tags         Client Access
// @Produce      application/octet-stream
// @Param        id            path   string  true   "Release ID"
// @Param        access_token  query  string  true   "Client access token"
// @Param        bucket        query  string  false  "S3 bucket name"
// @Success      200  {file}    file    "File download successful"
// @Failure      400  {object}  domain.Response  "Invalid request parameters"
// @Failure      401  {object}  domain.Response  "Invalid access token"
// @Failure      403  {object}  domain.Response  "Access token disabled or expired"
// @Failure      404  {object}  domain.Response  "Release not found"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /client-access/download/{id} [get]
func (cac *ClientAccessController) Download(c *gin.Context) {
	// 从查询参数获取 access_token
	accessToken := c.GetHeader(constants.AccessToken)
	if accessToken == "" {
		c.JSON(http.StatusUnauthorized, domain.RespError("access_token is required"))
		return
	}

	//验证 access_token
	clientAccess, err := cac.ClientAccessUsecase.ValidateAccessToken(c, accessToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.RespError("无效的访问令牌"))
		return
	}

	//检查凭证是否激活
	if !clientAccess.IsActive {
		c.JSON(http.StatusForbidden, domain.RespError("客户端接入凭证已被禁用"))
		return
	}

	// 检查是否过期
	if clientAccess.ExpiresAt != nil && clientAccess.ExpiresAt.Before(time.Now()) {
		c.JSON(http.StatusForbidden, domain.RespError("客户端接入凭证已过期"))
		return
	}

	// 获取release ID (实际是release的ID，例如: d23ib7frlmvmud0u2p6g)
	releaseID := c.Param("id")
	if releaseID == "" {
		c.JSON(http.StatusBadRequest, domain.RespError("release ID不能为空"))
		return
	}

	// 通过release ID获取release信息，从中获取file_path
	release, err := cac.ReleaseUsecase.GetReleaseByID(c, releaseID)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("找不到指定的版本"))
		return
	}

	bucket := c.DefaultQuery("bucket", cac.Env.S3Bucket)

	req := &domain.DownloadRequest{
		Bucket:     bucket,
		ObjectName: release.FilePath, // 使用release中的file_path
	}

	object, err := cac.FileUsecase.Download(c, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	defer object.Close()

	// 设置响应头，使用release中的文件名
	c.Header("Content-Disposition", "attachment; filename=\""+release.FileName+"\"")
	c.Header("Content-Type", "application/octet-stream")
	c.Header("Content-Length", strconv.FormatInt(release.FileSize, 10))

	// 流式传输文件内容
	if _, err := io.Copy(c.Writer, object); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
}

// Release godoc
// @Summary      Upload artifact for GoReleaser
// @Description  Upload artifact files for GoReleaser publish process using client access token (no JWT required). Project and package are determined from the access token.
// @Tags         Client Access
// @Accept       multipart/form-data
// @Produce      json
// @Param        x-access-token  header    string  true   "Client access token for GoReleaser"
// @Param        file           formData  file    true   "Artifact file to upload"
// @Param        version        formData  string  true   "Version tag (required)"
// @Param        artifact       formData  string  false  "Artifact name"
// @Param        os             formData  string  false  "Operating system"
// @Param        arch           formData  string  false  "Architecture"
// @Param        changelog      formData  string  false  "Release changelog"
// @Success      201  {object}  domain.Response  "Upload successful"
// @Failure      400  {object}  domain.Response  "Invalid request data"
// @Failure      401  {object}  domain.Response  "Invalid access token"
// @Failure      403  {object}  domain.Response  "Access token disabled or expired"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /client-access/release [post]
func (cac *ClientAccessController) Release(c *gin.Context) {
	// 从自定义头获取 x-access-token
	accessToken := c.GetHeader("x-access-token")
	if accessToken == "" {
		c.JSON(http.StatusUnauthorized, domain.RespError("x-access-token is required"))
		return
	}

	// 验证 access_token
	clientAccess, err := cac.ClientAccessUsecase.ValidateAccessToken(c, accessToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.RespError("无效的访问令牌"))
		return
	}

	// 检查凭证是否激活
	if !clientAccess.IsActive {
		c.JSON(http.StatusForbidden, domain.RespError("客户端接入凭证已被禁用"))
		return
	}

	// 检查是否过期
	if clientAccess.ExpiresAt != nil && clientAccess.ExpiresAt.Before(time.Now()) {
		c.JSON(http.StatusForbidden, domain.RespError("客户端接入凭证已过期"))
		return
	}

	// 获取上传的文件
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("无法获取上传文件: "+err.Error()))
		return
	}
	defer file.Close()

	// 获取GoReleaser相关参数
	version := c.PostForm("version")
	artifact := c.PostForm("artifact")
	osParam := c.PostForm("os")
	arch := c.PostForm("arch")
	changelog := c.PostForm("changelog")

	// 参数验证
	if version == "" {
		c.JSON(http.StatusBadRequest, domain.RespError("version is required"))
		return
	}

	// 从clientAccess中获取project_id和package_id
	projectID := clientAccess.ProjectID
	packageID := clientAccess.PackageID

	// 构建文件路径，支持GoReleaser的文件组织方式
	hierarchicalPrefix := "releases/" + packageID + "/" + version

	// 准备上传请求
	uploadReq := &domain.UploadRequest{
		Bucket:      cac.Env.S3Bucket,
		ObjectName:  header.Filename,
		Prefix:      hierarchicalPrefix,
		Reader:      file,
		Size:        header.Size,
		ContentType: "application/octet-stream",
	}

	// 调用文件上传业务逻辑
	uploadResp, err := cac.FileUsecase.Upload(c, uploadReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("文件上传失败: "+err.Error()))
		return
	}

	// 创建Release记录
	release := &domain.Release{
		PackageID:     packageID,
		VersionCode:   version,
		VersionName:   version,
		TagName:       version, // GoReleaser通常使用tag作为版本
		ChangeLog:     changelog,
		FilePath:      uploadResp.ObjectName,
		FileName:      header.Filename,
		FileSize:      header.Size,
		DownloadCount: 0,
		CreatedBy:     clientAccess.CreatedBy, // 使用客户端接入凭证的创建者
		CreatedAt:     time.Now(),
	}

	// 保存Release到数据库
	if err := cac.ReleaseUsecase.CreateRelease(c, release); err != nil {
		// 如果数据库保存失败，尝试删除已上传的文件
		_ = cac.FileUsecase.Delete(c, cac.Env.S3Bucket, uploadResp.ObjectName)
		c.JSON(http.StatusInternalServerError, domain.RespError("创建发布记录失败: "+err.Error()))
		return
	}

	// 构建响应数据
	response := map[string]interface{}{
		"release_id":  release.ID,
		"file_path":   uploadResp.ObjectName,
		"file_size":   header.Size,
		"filename":    header.Filename,
		"project_id":  projectID,
		"version":     version,
		"package_id":  packageID,
		"artifact":    artifact,
		"os":          osParam,
		"arch":        arch,
		"changelog":   changelog,
		"upload_time": time.Now(),
		"created_by":  release.CreatedBy,
	}

	c.JSON(http.StatusCreated, domain.RespSuccess(response))
}
