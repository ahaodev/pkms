package domain

import (
	"context"
	"io"
	"time"
)

type Package struct {
	ID               string    `json:"id"`
	ProjectID        string    `json:"project_id"`
	Name             string    `json:"name"`
	Description      string    `json:"description"`
	Type             string    `json:"type"`
	Version          string    `json:"version"`
	FileURL          string    `json:"file_url"`
	FileName         string    `json:"file_name"`
	FileSize         int64     `json:"file_size"`
	Checksum         string    `json:"checksum"`
	Changelog        string    `json:"changelog"`
	IsLatest         bool      `json:"is_latest"`
	DownloadCount    int       `json:"download_count"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	VersionCode      int       `json:"version_code"`
	MinSDKVersion    int       `json:"min_sdk_version"`
	TargetSDKVersion int       `json:"target_sdk_version"`
	ShareToken       string    `json:"share_token"`
	ShareExpiry      time.Time `json:"share_expiry"`
	IsPublic         bool      `json:"is_public"`
}

// PackageUploadRequest 包上传请求
type PackageUploadRequest struct {
	ProjectID        string    `json:"project_id" form:"project_id" binding:"required"`
	Name             string    `json:"name" form:"name" binding:"required"`
	Description      string    `json:"description" form:"description"`
	Version          string    `json:"version" form:"version" binding:"required"`
	Type             string    `json:"type" form:"type"`
	Changelog        string    `json:"changelog" form:"changelog"`
	VersionCode      int       `json:"version_code" form:"version_code"`
	MinSDKVersion    int       `json:"min_sdk_version" form:"min_sdk_version"`
	TargetSDKVersion int       `json:"target_sdk_version" form:"target_sdk_version"`
	IsLatest         bool      `json:"is_latest" form:"is_latest"`
	IsPublic         bool      `json:"is_public" form:"is_public"`
	ShareExpiry      time.Time `json:"share_expiry" form:"share_expiry"`

	// 文件相关字段（不通过JSON传输）
	File       io.Reader `json:"-"`
	FileName   string    `json:"-"`
	FileSize   int64     `json:"-"`
	FileHeader string    `json:"-"`
}

// PackageUploadResult 包上传结果
type PackageUploadResult struct {
	Package    *Package `json:"package"`
	FileURL    string   `json:"file_url"`
	UploadSize int64    `json:"upload_size"`
	Message    string   `json:"message"`
}

type PackageRepository interface {
	Create(c context.Context, pkg *Package) error
	Fetch(c context.Context, page, pageSize int) ([]Package, int, error)
	GetByID(c context.Context, id string) (Package, error)
	Update(c context.Context, pkg *Package) error
	Delete(c context.Context, id string) error
	GetByProjectID(c context.Context, projectID string) ([]Package, error)
	GetByShareToken(c context.Context, token string) (Package, error)
}

type PackageUsecase interface {
	Create(c context.Context, pkg *Package) error
	Fetch(c context.Context, page, pageSize int) ([]Package, int, error)
	GetByID(c context.Context, id string) (Package, error)
	Update(c context.Context, pkg *Package) error
	Delete(c context.Context, id string) error
	GetByProjectID(c context.Context, projectID string) ([]Package, error)
	GetByShareToken(c context.Context, token string) (Package, error)
	UploadPackage(c context.Context, req *PackageUploadRequest) (*PackageUploadResult, error)
}
