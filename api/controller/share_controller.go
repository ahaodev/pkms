package controller

import (
	"net/http"
	"pkms/bootstrap"
	"pkms/domain"
	"pkms/internal/constants"
	"pkms/pkg"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ShareController struct {
	ShareUsecase   domain.ShareUsecase
	ReleaseUsecase domain.ReleaseUsecase
	FileUsecase    domain.FileUsecase
	Env            *bootstrap.Env
}

// DownloadSharedRelease 通过分享码下载发布版本文件
// @Summary      Download shared release
// @Description  Download a release file using a share code without authentication
// @Tags         share(public)
// @Accept       json
// @Produce      application/octet-stream
// @Param        code  path  string  true  "Share code"
// @Success      200   {file} file   "Successfully downloaded shared release file"
// @Failure      404   {object} domain.Response  "Share not found or expired"
// @Failure      500   {object} domain.Response  "Download failed"
// @Router       /share/{code} [get]
func (sc *ShareController) DownloadSharedRelease(c *gin.Context) {
	code := c.Param("code")

	// Validate share and get share info
	share, err := sc.ShareUsecase.ValidateShare(c, code)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("Share not found or expired: "+err.Error()))
		return
	}

	// Get release information
	release, err := sc.ReleaseUsecase.GetReleaseByID(c, share.ReleaseID)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("Release not found"))
		return
	}

	// Increment download count
	err = sc.ReleaseUsecase.IncrementDownloadCount(c, share.ReleaseID)
	if err != nil {
		// Log error but don't block download
		pkg.Log.Error("Failed to increment download count:", err)
	}

	// Build download request
	downloadRequest := &domain.DownloadRequest{
		Bucket:     sc.Env.S3Bucket,
		ObjectName: release.FilePath,
	}

	reader, err := sc.FileUsecase.Download(c, downloadRequest)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("Download failed: "+err.Error()))
		return
	}
	defer reader.Close()

	// Set response headers
	c.Header("Content-Disposition", "attachment; filename="+release.FileName)
	c.Header("Content-Type", "application/octet-stream")
	c.Header("Content-Length", strconv.FormatInt(release.FileSize, 10))

	// Stream file
	c.DataFromReader(http.StatusOK, release.FileSize, "application/octet-stream", reader, map[string]string{
		"Content-Disposition": "attachment; filename=" + release.FileName,
	})
}

// GetShares 获取分享列表
// @Summary      Get share list
// @Description  Get all shares for the current tenant with pagination
// @Tags         Shares(management)
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        page     query  int  false  "Page number (default: 1)"
// @Param        page_size query  int  false  "Page size (default: 20)"
// @Success      200      {object} domain.Response{data=domain.SharePagedResult}  "Successfully retrieved shares"
// @Failure      400      {object} domain.Response  "Invalid query parameters"
// @Failure      500      {object} domain.Response  "Failed to get shares"
// @Router       /shares [get]
func (sc *ShareController) GetShares(c *gin.Context) {
	tenantID := c.GetHeader(constants.TenantID)

	// 解析分页参数
	var params domain.QueryParams
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("Invalid query parameters: "+err.Error()))
		return
	}

	// 验证和设置默认分页参数
	domain.ValidateQueryParams(&params)

	result, err := sc.ShareUsecase.GetAllSharesByTenantPaged(c, tenantID, params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("Failed to get shares: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(result))
}

// UpdateShareExpiry 更新分享过期时间
// @Summary      Update share expiry
// @Description  Update the expiry time of a specific share
// @Tags         Shares(management)
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path     string                        true  "Share ID"
// @Param        request body  domain.UpdateShareExpiryRequest true  "Update share expiry request"
// @Success      200  {object} domain.Response               "Successfully updated share expiry"
// @Failure      400  {object} domain.Response               "Invalid request parameters"
// @Failure      500  {object} domain.Response               "Update share expiry failed"
// @Router       /shares/{id}/expiry [put]
func (sc *ShareController) UpdateShareExpiry(c *gin.Context) {
	shareID := c.Param("id")

	var req domain.UpdateShareExpiryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("Invalid request parameters: "+err.Error()))
		return
	}

	shareResponse, err := sc.ShareUsecase.UpdateShareExpiry(c, shareID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("Update share expiry failed: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(shareResponse))
}

// DeleteShare 删除分享
// @Summary      Delete share
// @Description  Delete a specific share by ID
// @Tags         Shares(management)
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path     string  true  "Share ID"
// @Success      200  {object} domain.Response  "Successfully deleted share"
// @Failure      500  {object} domain.Response  "Delete share failed"
// @Router       /shares/{id} [delete]
func (sc *ShareController) DeleteShare(c *gin.Context) {
	shareID := c.Param("id")

	err := sc.ShareUsecase.DeleteShare(c, shareID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("Delete share failed: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Share deleted successfully"))
}
