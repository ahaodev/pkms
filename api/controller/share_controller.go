package controller

import (
	"net/http"
	"pkms/bootstrap"
	"pkms/domain"
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

// GetSharedRelease 通过分享码获取发布版本信息
func (sc *ShareController) GetSharedRelease(c *gin.Context) {
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

	// Return public release info (without sensitive data)
	response := map[string]interface{}{
		"code":       share.Code,
		"file_name":  release.FileName,
		"version":    release.Version,
		"file_size":  release.FileSize,
		"created_at": release.CreatedAt,
		"share_info": map[string]interface{}{
			"start_at":   share.StartAt,
			"expired_at": share.ExpiredAt,
		},
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// DownloadSharedRelease 通过分享码下载发布版本文件
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