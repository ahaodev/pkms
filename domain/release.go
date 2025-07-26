package domain

import (
	"context"
	"io"
	"time"
)

// CreateReleaseRequest 创建发布请求
type CreateReleaseRequest struct {
	PackageID   string `json:"package_id" form:"package_id" binding:"required"`
	VersionCode string `json:"version_code" form:"version_code" binding:"required"`
	VersionName string `json:"version_name" form:"version_name" binding:"required"`
	TagName     string `json:"tag_name" form:"tag_name"`
	Changelog   string `json:"changelog" form:"changelog"` // Release notes

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
	VersionCode   string    `json:"version_code"`
	TagName       string    `json:"tag_name,omitempty"`
	VersionName   string    `json:"version_name,omitempty"`
	ChangeLog     string    `json:"changelog,omitempty"` // Release notes/changelog
	FilePath      string    `json:"file_path"`
	FileName      string    `json:"file_name"`
	FileSize      int64     `json:"file_size"`
	FileHash      string    `json:"file_hash,omitempty"`
	DownloadCount int       `json:"download_count"`
	ShareToken    string    `json:"share_token,omitempty"`
	ShareExpiry   time.Time `json:"share_expiry,omitempty"`
	CreatedBy     string    `json:"created_by"`
	CreatedAt     time.Time `json:"created_at"`
}

// ReleaseRepository interface for release management
type ReleaseRepository interface {
	Create(c context.Context, release *Release) error
	GetByID(c context.Context, id string) (*Release, error)
	GetByPackageID(c context.Context, packageID string) ([]*Release, error)
	GetLatestByPackageID(c context.Context, packageID string) (*Release, error)
	GetByShareToken(c context.Context, token string) (*Release, error)
	Delete(c context.Context, id string) error
	IncrementDownloadCount(c context.Context, id string) error
}

// ReleaseUsecase interface for release business logic
type ReleaseUsecase interface {
	CreateRelease(c context.Context, release *Release) error
	GetReleaseByID(c context.Context, id string) (*Release, error)
	GetReleasesByPackage(c context.Context, packageID string) ([]*Release, error)
	GetLatestRelease(c context.Context, packageID string) (*Release, error)
	GetReleaseByShareToken(c context.Context, token string) (*Release, error)
	DeleteRelease(c context.Context, id string) error
	IncrementDownloadCount(c context.Context, releaseID string) error
}
