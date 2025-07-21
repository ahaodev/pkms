package domain

import (
	"context"
	"time"
)

// UpgradeTarget 升级目标实体
type UpgradeTarget struct {
	ID          string    `json:"id"`
	TenantID    string    `json:"tenant_id"`
	ProjectID   string    `json:"project_id"`
	PackageID   string    `json:"package_id"`
	ReleaseID   string    `json:"release_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	IsActive    bool      `json:"is_active"`
	CreatedBy   string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// 关联信息（从其他表查询获得）
	ProjectName string `json:"project_name,omitempty"`
	PackageName string `json:"package_name,omitempty"`
	PackageType string `json:"package_type,omitempty"`
	Version     string `json:"version,omitempty"`
	FileName    string `json:"file_name,omitempty"`
	FileSize    int64  `json:"file_size,omitempty"`
	FileHash    string `json:"file_hash,omitempty"`
	DownloadURL string `json:"download_url,omitempty"`
}

// CreateUpgradeTargetRequest 创建升级目标请求
type CreateUpgradeTargetRequest struct {
	ProjectID   string `json:"project_id" binding:"required"`
	PackageID   string `json:"package_id" binding:"required"`
	ReleaseID   string `json:"release_id" binding:"required"`
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

// UpdateUpgradeTargetRequest 更新升级目标请求
type UpdateUpgradeTargetRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	IsActive    *bool  `json:"is_active"`
}

// CheckUpdateRequest 检查更新请求
type CheckUpdateRequest struct {
	ProjectID      string `json:"project_id"`
	PackageID      string `json:"package_id"`
	CurrentVersion string `json:"current_version"`
}

// CheckUpdateResponse 检查更新响应
type CheckUpdateResponse struct {
	HasUpdate      bool   `json:"has_update"`
	CurrentVersion string `json:"current_version"`
	LatestVersion  string `json:"latest_version"`
	DownloadURL    string `json:"download_url,omitempty"`
	FileSize       int64  `json:"file_size,omitempty"`
	FileHash       string `json:"file_hash,omitempty"`
	Changelog      string `json:"changelog,omitempty"`
	ReleaseNotes   string `json:"release_notes,omitempty"`
}

// UpgradeRepository 升级目标数据仓库接口
type UpgradeRepository interface {
	// 创建升级目标
	CreateUpgradeTarget(ctx context.Context, upgrade *UpgradeTarget) error
	// 根据ID获取升级目标
	GetUpgradeTargetByID(ctx context.Context, id string) (*UpgradeTarget, error)
	// 获取升级目标列表
	GetUpgradeTargets(ctx context.Context, tenantID string, filters map[string]interface{}) ([]*UpgradeTarget, error)
	// 更新升级目标
	UpdateUpgradeTarget(ctx context.Context, id string, updates map[string]interface{}) error
	// 删除升级目标
	DeleteUpgradeTarget(ctx context.Context, id string) error
	// 根据包ID获取激活的升级目标
	GetActiveUpgradeTargetByPackageID(ctx context.Context, packageID string) (*UpgradeTarget, error)
	// 检查项目下的包是否有升级目标
	CheckProjectUpgradeTargets(ctx context.Context, projectID string, packageIDs []string) (map[string]*UpgradeTarget, error)
}

// UpgradeUsecase 升级目标业务逻辑接口
type UpgradeUsecase interface {
	// 创建升级目标
	CreateUpgradeTarget(ctx context.Context, request *CreateUpgradeTargetRequest, userID, tenantID string) (*UpgradeTarget, error)
	// 获取升级目标列表
	GetUpgradeTargets(ctx context.Context, tenantID string, filters map[string]interface{}) ([]*UpgradeTarget, error)
	// 根据ID获取升级目标
	GetUpgradeTargetByID(ctx context.Context, id string) (*UpgradeTarget, error)
	// 更新升级目标
	UpdateUpgradeTarget(ctx context.Context, id string, request *UpdateUpgradeTargetRequest) error
	// 删除升级目标
	DeleteUpgradeTarget(ctx context.Context, id string) error
	// 检查更新（供客户端调用）
	CheckUpdate(ctx context.Context, request *CheckUpdateRequest) (*CheckUpdateResponse, error)
	// 获取项目的所有升级目标
	GetProjectUpgradeTargets(ctx context.Context, projectID string) ([]*UpgradeTarget, error)
}
