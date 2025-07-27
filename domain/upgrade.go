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
	AccessToken    string `json:"access_token" binding:"required"`
	CurrentVersion string `json:"current_version" binding:"required"`
	ClientInfo     string `json:"client_info,omitempty"` // 客户端信息，可选
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
}

// ClientAccess 客户端接入实体
type ClientAccess struct {
	ID           string    `json:"id"`
	TenantID     string    `json:"tenant_id"`
	ProjectID    string    `json:"project_id"`
	PackageID    string    `json:"package_id"`
	AccessToken  string    `json:"access_token"`
	Name         string    `json:"name"`
	Description  string    `json:"description,omitempty"`
	IsActive     bool      `json:"is_active"`
	ExpiresAt    *time.Time `json:"expires_at,omitempty"`
	LastUsedAt   *time.Time `json:"last_used_at,omitempty"`
	LastUsedIP   string    `json:"last_used_ip,omitempty"`
	UsageCount   int       `json:"usage_count"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	CreatedBy    string    `json:"created_by"`

	// 关联信息
	ProjectName string `json:"project_name,omitempty"`
	PackageName string `json:"package_name,omitempty"`
	CreatorName string `json:"creator_name,omitempty"`
}

// CreateClientAccessRequest 创建客户端接入请求
type CreateClientAccessRequest struct {
	ProjectID   string     `json:"project_id" binding:"required"`
	PackageID   string     `json:"package_id" binding:"required"`
	Name        string     `json:"name" binding:"required"`
	Description string     `json:"description"`
	ExpiresAt   *time.Time `json:"expires_at"`
}

// UpdateClientAccessRequest 更新客户端接入请求
type UpdateClientAccessRequest struct {
	Name        string     `json:"name"`
	Description string     `json:"description"`
	IsActive    *bool      `json:"is_active"`
	ExpiresAt   *time.Time `json:"expires_at"`
}

// ClientAccessRepository 客户端接入数据仓库接口
type ClientAccessRepository interface {
	Create(ctx context.Context, access *ClientAccess) error
	GetByID(ctx context.Context, id string) (*ClientAccess, error)
	GetByAccessToken(ctx context.Context, token string) (*ClientAccess, error)
	GetList(ctx context.Context, tenantID string, filters map[string]interface{}) ([]*ClientAccess, error)
	Update(ctx context.Context, id string, updates map[string]interface{}) error
	Delete(ctx context.Context, id string) error
	UpdateUsage(ctx context.Context, token string, ip string) error
}

// ClientAccessUsecase 客户端接入业务逻辑接口
type ClientAccessUsecase interface {
	Create(ctx context.Context, request *CreateClientAccessRequest, userID, tenantID string) (*ClientAccess, error)
	GetList(ctx context.Context, tenantID string, filters map[string]interface{}) ([]*ClientAccess, error)
	GetByID(ctx context.Context, id string) (*ClientAccess, error)
	Update(ctx context.Context, id string, request *UpdateClientAccessRequest) error
	Delete(ctx context.Context, id string) error
	ValidateAccessToken(ctx context.Context, token string) (*ClientAccess, error)
	RegenerateToken(ctx context.Context, id string) (string, error)
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
	// 通过access token检查更新
	CheckUpdateByToken(ctx context.Context, request *CheckUpdateRequest, clientIP string) (*CheckUpdateResponse, error)
	// 获取项目的所有升级目标
	GetProjectUpgradeTargets(ctx context.Context, projectID string) ([]*UpgradeTarget, error)
}
