package domain

import (
	"context"
	"io"
	"time"
)

// Package represents a package (without versions) - 新的包结构
type Package struct {
	ID             string    `json:"id"`
	ProjectID      string    `json:"project_id"`
	Name           string    `json:"name"`
	Type           string    `json:"type"`
	Description    string    `json:"description"`
	CreatedBy      string    `json:"created_by"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	LatestRelease  *Release  `json:"latest_release,omitempty"`
	ReleaseCount   int       `json:"release_count"`
	TotalDownloads int       `json:"total_downloads"`
}

// CreatePackageRequest 创建包请求
type CreatePackageRequest struct {
	ProjectID   string `json:"project_id" form:"project_id" binding:"required"`
	Name        string `json:"name" form:"name" binding:"required"`
	Type        string `json:"type" form:"type" binding:"required"`
	Description string `json:"description" form:"description"`
}

// PackageUploadRequest 上传包文件创建发布版本的请求
type PackageUploadRequest struct {
	ProjectID    string `form:"project_id" binding:"required"`
	PackageID    string `form:"package_id"`
	Name         string `form:"name"`
	Description  string `form:"description"`
	Version      string `form:"version" binding:"required"`
	Type         string `form:"type"`
	TagName      string `form:"tag_name"`
	Title        string `form:"title"`
	Changelog    string `form:"changelog"`
	IsPrerelease bool   `form:"is_prerelease"`
	IsLatest     bool   `form:"is_latest"`
	IsDraft      bool   `form:"is_draft"`

	// 文件相关字段（不通过JSON传输）
	File       io.Reader `json:"-"`
	FileName   string    `json:"-"`
	FileSize   int64     `json:"-"`
	FileHeader string    `json:"-"`
}

// PackageRepository interface for package basic information
type PackageRepository interface {
	Create(c context.Context, pkg *Package) error
	GetByID(c context.Context, id string) (*Package, error)
	GetByProjectID(c context.Context, projectID string) ([]*Package, error)
	Update(c context.Context, pkg *Package) error
	Delete(c context.Context, id string) error
	FetchByProject(c context.Context, projectID string, page, pageSize int) ([]*Package, int, error)
}

// PackageUsecase interface for package business logic
type PackageUsecase interface {
	CreatePackage(c context.Context, pkg *Package) error
	GetPackageByID(c context.Context, id string) (*Package, error)
	GetPackagesByProject(c context.Context, projectID string, page, pageSize int) ([]*Package, int, error)
	DeletePackage(c context.Context, id string) error

	CreateRelease(c context.Context, release *Release) error
	GetReleaseByID(c context.Context, id string) (*Release, error)
	GetReleasesByPackage(c context.Context, packageID string) ([]*Release, error)
	GetLatestRelease(c context.Context, packageID string) (*Release, error)
	IncrementDownloadCount(c context.Context, releaseID string) error
	SetReleaseAsLatest(c context.Context, packageID, releaseID string) error
}
