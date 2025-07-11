package domain

import (
	"context"
	"io"
	"time"
)

// CreateReleaseRequest 创建发布请求
type CreateReleaseRequest struct {
	PackageID    string    `json:"package_id" form:"package_id" binding:"required"`
	Version      string    `json:"version" form:"version" binding:"required"`
	TagName      string    `json:"tag_name" form:"tag_name"`
	Title        string    `json:"title" form:"title"`
	Description  string    `json:"description" form:"description"` // Release notes
	IsPrerelease bool      `json:"is_prerelease" form:"is_prerelease"`
	IsLatest     bool      `json:"is_latest" form:"is_latest"`
	IsDraft      bool      `json:"is_draft" form:"is_draft"`
	IsPublic     bool      `json:"is_public" form:"is_public"`
	ShareExpiry  time.Time `json:"share_expiry" form:"share_expiry"`

	// 文件相关字段（不通过JSON传输）
	File       io.Reader `json:"-"`
	FileName   string    `json:"-"`
	FileSize   int64     `json:"-"`
	FileHeader string    `json:"-"`
}

// Release represents a package release/version - 发布版本
type Release struct {
	ID            string    `json:"id"`
	PackageID     string    `json:"package_id"`
	Version       string    `json:"version"`
	TagName       string    `json:"tag_name,omitempty"`
	Title         string    `json:"title,omitempty"`
	Description   string    `json:"description,omitempty"` // Release notes/changelog
	FilePath      string    `json:"file_path"`
	FileName      string    `json:"file_name"`
	FileSize      int64     `json:"file_size"`
	FileHash      string    `json:"file_hash,omitempty"`
	IsPrerelease  bool      `json:"is_prerelease"`
	IsLatest      bool      `json:"is_latest"`
	IsDraft       bool      `json:"is_draft"`
	DownloadCount int       `json:"download_count"`
	ShareToken    string    `json:"share_token,omitempty"`
	ShareExpiry   time.Time `json:"share_expiry,omitempty"`
	IsPublic      bool      `json:"is_public"`
	CreatedBy     string    `json:"created_by"`
	CreatedAt     time.Time `json:"created_at"`
	PublishedAt   time.Time `json:"published_at,omitempty"`
}

// ReleaseRepository interface for release management
type ReleaseRepository interface {
	Create(c context.Context, release *Release) error
	GetByID(c context.Context, id string) (*Release, error)
	GetByPackageID(c context.Context, packageID string) ([]*Release, error)
	GetLatestByPackageID(c context.Context, packageID string) (*Release, error)
	GetByShareToken(c context.Context, token string) (*Release, error)
	Update(c context.Context, release *Release) error
	Delete(c context.Context, id string) error
	IncrementDownloadCount(c context.Context, id string) error
	SetAsLatest(c context.Context, packageID, releaseID string) error
}

// ReleaseUsecase interface for release business logic
type ReleaseUsecase interface {
	CreateRelease(c context.Context, release *Release) error
	GetReleaseByID(c context.Context, id string) (*Release, error)
	GetReleasesByPackage(c context.Context, packageID string) ([]*Release, error)
	GetLatestRelease(c context.Context, packageID string) (*Release, error)
	GetReleaseByShareToken(c context.Context, token string) (*Release, error)
	UpdateRelease(c context.Context, release *Release) error
	DeleteRelease(c context.Context, id string) error
	IncrementDownloadCount(c context.Context, releaseID string) error
	SetAsLatest(c context.Context, packageID, releaseID string) error
	PublishRelease(c context.Context, releaseID string) error
}
