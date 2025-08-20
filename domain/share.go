package domain

import (
	"context"
	"time"
)

// CreateShareRequest 创建分享链接的请求
type CreateShareRequest struct {
	ReleaseID   string `json:"release_id"`
	ExpiryHours int    `json:"expiry_hours"`
}

// UpdateShareExpiryRequest 更新分享过期时间的请求
type UpdateShareExpiryRequest struct {
	ExpiryHours int `json:"expiry_hours"`
}

// ShareResponse 分享链接响应
type ShareResponse struct {
	ID          string     `json:"id"`
	Code        string     `json:"code"`
	ShareURL    string     `json:"share_url"`
	ReleaseID   string     `json:"release_id"`
	ExpiryHours int        `json:"expiry_hours"`
	FileName    string     `json:"file_name"`
	Version     string     `json:"version"`
	StartAt     time.Time  `json:"start_at"`
	ExpiredAt   *time.Time `json:"expired_at,omitempty"`
}

// Share 结构体定义了分享信息
type Share struct {
	ID        string     `json:"id"`
	Code      string     `json:"code"`
	ReleaseID string     `json:"release_id"`
	StartAt   time.Time  `json:"start_at"`
	ExpiredAt *time.Time `json:"expired_at,omitempty"`
}

// ShareListItem 分享列表项
type ShareListItem struct {
	ID          string     `json:"id"`
	Code        string     `json:"code"`
	ProjectName string     `json:"project_name"`
	PackageName string     `json:"package_name"`
	Version     string     `json:"version"`
	FileName    string     `json:"file_name"`
	ShareURL    string     `json:"share_url"`
	StartAt     time.Time  `json:"start_at"`
	ExpiredAt   *time.Time `json:"expired_at,omitempty"`
	IsExpired   bool       `json:"is_expired"`
}

// SharePagedResult 分享分页查询结果
type SharePagedResult = PagedResult[*ShareListItem]

type ShareRepository interface {
	Create(c context.Context, share *Share) (*Share, error)
	GetByCode(c context.Context, code string) (*Share, error)
	GetByReleaseID(c context.Context, releaseID string) ([]*Share, error)
	GetAllByTenant(c context.Context, tenantID string) ([]*ShareListItem, error)
	GetAllByTenantPaged(c context.Context, tenantID string, params QueryParams) (*SharePagedResult, error)
	UpdateExpiry(c context.Context, id string, expiryHours int) (*Share, error)
	DeleteByID(c context.Context, id string) error
	DeleteExpired(c context.Context) error
}

type ShareUsecase interface {
	CreateShare(c context.Context, req *CreateShareRequest) (*ShareResponse, error)
	ValidateShare(c context.Context, code string) (*Share, error)
	GetAllSharesByTenant(c context.Context, tenantID string) ([]*ShareListItem, error)
	GetAllSharesByTenantPaged(c context.Context, tenantID string, params QueryParams) (*SharePagedResult, error)
	UpdateShareExpiry(c context.Context, id string, req *UpdateShareExpiryRequest) (*ShareResponse, error)
	DeleteShare(c context.Context, id string) error
}
