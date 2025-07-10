package domain

import (
	"context"
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

type PackageRepository interface {
	Create(c context.Context, pkg *Package) error
	Fetch(c context.Context) ([]Package, error)
	GetByID(c context.Context, id string) (Package, error)
	Update(c context.Context, pkg *Package) error
	Delete(c context.Context, id string) error
	GetByProjectID(c context.Context, projectID string) ([]Package, error)
	GetByShareToken(c context.Context, token string) (Package, error)
}

type PackageUsecase interface {
	Create(c context.Context, pkg *Package) error
	Fetch(c context.Context) ([]Package, error)
	GetByID(c context.Context, id string) (Package, error)
	Update(c context.Context, pkg *Package) error
	Delete(c context.Context, id string) error
	GetByProjectID(c context.Context, projectID string) ([]Package, error)
	GetByShareToken(c context.Context, token string) (Package, error)
}
