package domain

/**
CREATE TABLE projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    package_count INTEGER NOT NULL DEFAULT 0,
    created_by VARCHAR(50) NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
*/

import (
	"context"
	"time"
)

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

type ProjectRepository interface {
	Create(c context.Context, project *Project) error
	Fetch(c context.Context) ([]Project, error)
	GetByID(c context.Context, id string) (Project, error)
	Update(c context.Context, project *Project) error
	Delete(c context.Context, id string) error
	GetByUserID(c context.Context, userID string) ([]Project, error)
}

type ProjectUsecase interface {
	Create(c context.Context, project *Project) error
	Fetch(c context.Context) ([]Project, error)
	GetByID(c context.Context, id string) (Project, error)
	Update(c context.Context, project *Project) error
	Delete(c context.Context, id string) error
	GetByUserID(c context.Context, userID string) ([]Project, error)
}
