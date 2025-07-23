package domain

import (
	"context"
	"time"
)

// Share 结构体定义了分享信息
type Share struct {
	ID        string     `json:"id"`
	Code      string     `json:"code"`
	ReleaseID string     `json:"release_id"`
	StartAt   time.Time  `json:"start_at"`
	ExpiredAt *time.Time `json:"expired_at,omitempty"`
}

// CreateShareRequest 创建分享链接的请求
type CreateShareRequest struct {
	ReleaseID   string `json:"release_id"`
	ExpiryHours int    `json:"expiry_hours"`
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

type ShareRepository interface {
	Create(c context.Context, share *Share) error
	GetByCode(c context.Context, code string) (*Share, error)
	GetByReleaseID(c context.Context, releaseID string) ([]*Share, error)
	DeleteExpired(c context.Context) error
}

type ShareUsecase interface {
	CreateShare(c context.Context, req *CreateShareRequest) (*ShareResponse, error)
	GetShareByCode(c context.Context, code string) (*Share, error)
	ValidateShare(c context.Context, code string) (*Share, error)
}
