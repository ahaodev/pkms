package domain

import (
	"context"
	"io"
	"time"
)

// CreatePackageRequest 创建包请求
type CreatePackageRequest struct {
	ProjectID   string `json:"project_id" form:"project_id" binding:"required"`
	Name        string `json:"name" form:"name" binding:"required"`
	Type        string `json:"type" form:"type" binding:"required"`
	Description string `json:"description" form:"description"`
}

// ReleaseUploadRequest 上传包文件创建发布版本的请求
type ReleaseUploadRequest struct {
	PackageID    string `form:"package_id"`
	Name         string `form:"name"`
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

// CreateReleaseRequest 创建发布请求
type CreateReleaseRequest struct {
	PackageID   string `json:"package_id" form:"package_id" binding:"required"`
	VersionCode string `json:"version_code" form:"version_code" binding:"required"`
	VersionName string `json:"version_name" form:"version_name" binding:"required"`
	TagName     string `json:"tag_name" form:"tag_name"`
	Changelog   string `json:"changelog" form:"changelog"`

	// 文件相关字段（不通过JSON传输）
	File       io.Reader `json:"-"`
	FileName   string    `json:"-"`
	FileSize   int64     `json:"-"`
	FileHeader string    `json:"-"`
}

type Project struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	Icon         string    `json:"icon"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	PackageCount int       `json:"package_count"`
	TenantID     string    `json:"tenant_id"`
	CreatedBy    string    `json:"created_by"`
}

// ProjectPagedResult 项目分页查询结果
type ProjectPagedResult = PagedResult[*Project]

type ProjectRepository interface {
	Create(c context.Context, project *Project) error
	Fetch(c context.Context, tenantID string) ([]*Project, error)
	FetchPaged(c context.Context, tenantID string, params QueryParams) (*ProjectPagedResult, error)
	FetchAll(c context.Context) ([]*Project, error)
	GetByID(c context.Context, id string) (*Project, error)
	Update(c context.Context, project *Project) error
	Delete(c context.Context, id string) error
	GetByUserID(c context.Context, userID string) ([]*Project, error)
}

type ProjectUsecase interface {
	Create(c context.Context, project *Project) error
	Fetch(c context.Context, tenantID string) ([]*Project, error)
	FetchPaged(c context.Context, tenantID string, params QueryParams) (*ProjectPagedResult, error)
	GetByID(c context.Context, id string) (*Project, error)
	Update(c context.Context, project *Project) error
	Delete(c context.Context, id string) error
	GetByUserID(c context.Context, userID string) ([]*Project, error)
}
