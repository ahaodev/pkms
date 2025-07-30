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

// DownloadSharedRelease 通过分享码下载发布版本文件
// @Summary      Download shared release
// @Description  Download a release file using a share code without authentication
// @Tags         Sharing
// @Accept       json
// @Produce      application/octet-stream
// @Param        code  path  string  true  "Share code"
// @Success      200   {file} file   "Successfully downloaded shared release file"
// @Failure      404   {object} domain.Response  "Share not found or expired"
// @Failure      500   {object} domain.Response  "Download failed"
// @Router       /share/{code}/download [get]
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
