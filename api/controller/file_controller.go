package controller

import (
	"fmt"
	"io"
	"net/http"
	"strconv"

	"pkms/bootstrap"
	"pkms/domain"

	"github.com/gin-gonic/gin"
)

type FileController struct {
	FileUsecase domain.FileUsecase
	Env         *bootstrap.Env
}

// List 获取文件列表
func (fc *FileController) List(c *gin.Context) {
	bucket := c.DefaultQuery("bucket", fc.Env.S3Bucket)
	prefix := c.DefaultQuery("prefix", "")

	files, err := fc.FileUsecase.List(c, bucket, prefix)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(files))
}

// Upload 上传文件
func (fc *FileController) Upload(c *gin.Context) {
	bucket := c.DefaultQuery("bucket", fc.Env.S3Bucket)
	prefix := c.DefaultQuery("prefix", "")

	// 获取上传的文件
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("Failed to get file: "+err.Error()))
		return
	}
	defer file.Close()

	// 构建上传请求
	req := &domain.UploadRequest{
		Bucket:      bucket,
		ObjectName:  header.Filename,
		Prefix:      prefix,
		Reader:      file,
		Size:        header.Size,
		ContentType: header.Header.Get("Content-Type"),
	}

	if req.ContentType == "" {
		req.ContentType = "application/octet-stream"
	}

	result, err := fc.FileUsecase.Upload(c, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("Failed to upload file: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(result))
}

// Download 下载文件
func (fc *FileController) Download(c *gin.Context) {
	bucket := c.DefaultQuery("bucket", fc.Env.S3Bucket)
	objectName := c.Param("name")

	if objectName == "" {
		c.JSON(http.StatusBadRequest, domain.RespError("Object name is required"))
		return
	}

	req := &domain.DownloadRequest{
		Bucket:     bucket,
		ObjectName: objectName,
	}

	object, err := fc.FileUsecase.Download(c, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	defer object.Close()

	// 获取对象信息
	stat, err := fc.FileUsecase.GetObjectStat(c, bucket, objectName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	// 设置响应头
	c.Header("Content-Disposition", "attachment; filename=\""+stat.Name+"\"")
	c.Header("Content-Type", "application/octet-stream")
	c.Header("Content-Length", strconv.FormatInt(stat.Size, 10))

	// 流式传输文件内容
	if _, err := io.Copy(c.Writer, object); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
}

// DownloadWithProgress 带进度的下载（流式下载）
func (fc *FileController) DownloadWithProgress(c *gin.Context) {
	bucket := c.DefaultQuery("bucket", fc.Env.S3Bucket)
	objectName := c.DefaultQuery("object", "")

	if objectName == "" {
		c.JSON(http.StatusBadRequest, domain.RespError("Object name is required"))
		return
	}

	req := &domain.DownloadRequest{
		Bucket:     bucket,
		ObjectName: objectName,
	}

	object, err := fc.FileUsecase.Download(c, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	defer object.Close()

	// 获取对象信息
	stat, err := fc.FileUsecase.GetObjectStat(c, bucket, objectName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	// 设置响应头
	c.Header("Content-Disposition", "attachment; filename=\""+objectName+"\"")
	c.Header("Content-Type", "application/octet-stream")
	c.Header("Content-Length", strconv.FormatInt(stat.Size, 10))

	// 流式传输文件内容
	if _, err := io.Copy(c.Writer, object); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
}

// Delete 删除文件
func (fc *FileController) Delete(c *gin.Context) {
	bucket := c.DefaultQuery("bucket", fc.Env.S3Bucket)
	objectName := c.DefaultQuery("object", "")

	if objectName == "" {
		c.JSON(http.StatusBadRequest, domain.RespError("Object name is required"))
		return
	}

	err := fc.FileUsecase.Delete(c, bucket, objectName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(fmt.Sprintf("Object %s deleted successfully from bucket %s", objectName, bucket)))
}

// GetObjectInfo 获取对象信息
func (fc *FileController) GetObjectInfo(c *gin.Context) {
	bucket := c.DefaultQuery("bucket", fc.Env.S3Bucket)
	objectName := c.Param("name")

	if objectName == "" {
		c.JSON(http.StatusBadRequest, domain.RespError("Object name is required"))
		return
	}

	stat, err := fc.FileUsecase.GetObjectStat(c, bucket, objectName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(stat))
}
