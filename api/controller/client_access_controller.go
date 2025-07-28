package controller

import (
	"github.com/gin-gonic/gin"
	"io"
	"net/http"
	"pkms/bootstrap"
	"pkms/domain"
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

// CheckUpdate 检查更新（客户端调用，无需JWT认证，使用access_token）
func (cac *ClientAccessController) CheckUpdate(c *gin.Context) {
	clientIP := c.ClientIP()

	var request domain.CheckUpdateRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	// 验证 access_token
	clientAccess, err := cac.ClientAccessUsecase.ValidateAccessToken(c, request.AccessToken)
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
	response, err := cac.UpgradeUsecase.CheckUpdateByToken(c, &request, clientIP)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// Download 下载文件（客户端调用，无需JWT认证，使用access_token）
func (cac *ClientAccessController) Download(c *gin.Context) {
	// 从查询参数获取 access_token
	accessToken := c.Query("access_token")
	if accessToken == "" {
		c.JSON(http.StatusUnauthorized, domain.RespError("access_token is required"))
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
