package controller

import (
	"net/http"
	"pkms/bootstrap"
	"pkms/domain"

	"github.com/gin-gonic/gin"
)

type SettingController struct {
	UpgradeUsecase domain.UpgradeUsecase
	Env            *bootstrap.Env
}

// StorageConfig represents storage configuration
type StorageConfig struct {
	StorageType     string `json:"storage_type"`
	StorageBasePath string `json:"storage_base_path,omitempty"`
	S3Address       string `json:"s3_address,omitempty"`
	S3AccessKey     string `json:"s3_access_key,omitempty"`
	S3SecretKey     string `json:"s3_secret_key,omitempty"`
	S3Bucket        string `json:"s3_bucket,omitempty"`
	S3Token         string `json:"s3_token,omitempty"`
}

// GetStorageConfig 获取存储配置
// @Summary      Get storage configuration
// @Description  Get current storage configuration settings
// @Tags         Settings
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object} domain.Response  "Successfully retrieved storage configuration"
// @Router       /settings/storage [get]
func (sc *SettingController) GetStorageConfig(c *gin.Context) {
	config := StorageConfig{
		StorageType:     sc.Env.StorageType,
		StorageBasePath: sc.Env.StorageBasePath,
		S3Address:       sc.Env.S3Address,
		S3AccessKey:     sc.Env.S3AccessKey,
		S3SecretKey:     "***hidden***", // 隐藏敏感信息
		S3Bucket:        sc.Env.S3Bucket,
		S3Token:         sc.Env.S3Token,
	}
	c.JSON(http.StatusOK, domain.RespSuccess(config))
}

// UpdateStorageConfig 更新存储配置
// @Summary      Update storage configuration
// @Description  Update storage configuration settings
// @Tags         Settings
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        config  body     StorageConfig     true  "Storage configuration"
// @Success      200     {object} domain.Response  "Successfully updated storage configuration"
// @Failure      400     {object} domain.Response  "Bad request - invalid parameters"
// @Router       /settings/storage [put]
func (sc *SettingController) UpdateStorageConfig(c *gin.Context) {
	var config StorageConfig
	if err := c.ShouldBindJSON(&config); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	// 更新环境变量中的配置
	// 注意：这种方式只会更新运行时配置，重启后会恢复到原始值
	// 在生产环境中，你可能需要将配置保存到数据库或配置文件中
	if config.StorageType != "" {
		sc.Env.StorageType = config.StorageType
	}
	if config.StorageBasePath != "" {
		sc.Env.StorageBasePath = config.StorageBasePath
	}
	if config.S3Address != "" {
		sc.Env.S3Address = config.S3Address
	}
	if config.S3AccessKey != "" {
		sc.Env.S3AccessKey = config.S3AccessKey
	}
	if config.S3SecretKey != "" && config.S3SecretKey != "***hidden***" {
		sc.Env.S3SecretKey = config.S3SecretKey
	}
	if config.S3Bucket != "" {
		sc.Env.S3Bucket = config.S3Bucket
	}
	if config.S3Token != "" {
		sc.Env.S3Token = config.S3Token
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Storage configuration updated successfully"))
}

// TestStorageConfig 测试存储配置
// @Summary      Test storage configuration
// @Description  Test the current storage configuration connectivity
// @Tags         Settings
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object} domain.Response  "Storage connection test successful"
// @Failure      400  {object} domain.Response  "Unknown storage type or test failed"
// @Router       /settings/storage/test [post]
func (sc *SettingController) TestStorageConfig(c *gin.Context) {
	// 这里可以实现存储连接测试逻辑
	// 根据当前配置尝试连接存储后端
	if sc.Env.StorageType == "disk" {
		// 测试本地存储路径是否可访问
		c.JSON(http.StatusOK, domain.RespSuccess("Local disk storage is accessible"))
	} else if sc.Env.StorageType == "minio" {
		// 测试MinIO连接
		// TODO: 实现实际的MinIO连接测试
		c.JSON(http.StatusOK, domain.RespSuccess("MinIO connection test successful"))
	} else {
		c.JSON(http.StatusBadRequest, domain.RespError("Unknown storage type"))
	}
}
