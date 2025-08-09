package domain

import (
	"context"
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

// PackageRepository interface for package basic information
type PackageRepository interface {
	Create(c context.Context, pkg *Package) error
	GetByID(c context.Context, id string) (*Package, error)
	GetByProjectID(c context.Context, projectID string) ([]*Package, error)
	FetchAll(c context.Context, page, pageSize int) ([]*Package, int, error)
	FetchByProject(c context.Context, projectID string, page, pageSize int) ([]*Package, int, error)
	Update(c context.Context, pkg *Package) error
	Delete(c context.Context, id string) error
}

// PackageUsecase interface for package business logic
type PackageUsecase interface {
	CreatePackage(c context.Context, pkg *Package) error
	GetPackageByID(c context.Context, id string) (*Package, error)
	GetAllPackages(c context.Context, page, pageSize int) ([]*Package, int, error)
	GetPackagesByProject(c context.Context, projectID string, page, pageSize int) ([]*Package, int, error)
	DeletePackage(c context.Context, id string) error
	UpdatePackage(c context.Context, pkg *Package) error
	GetLatestRelease(c context.Context, packageID string) (*Release, error)
	IncrementDownloadCount(c context.Context, releaseID string) error
}
