package domain

import (
	"context"
	"time"
)

type DashboardStats struct {
	TotalProjects  int `json:"total_projects"`
	TotalPackages  int `json:"total_packages"`
	TotalReleases  int `json:"total_releases"`
	TotalDownloads int `json:"total_downloads"`
}

type RecentActivity struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"` // "project_created", "package_uploaded", "user_joined"
	Description string    `json:"description"`
	UserID      string    `json:"user_id"`
	CreatedAt   time.Time `json:"created_at"`
}

type DashboardRepository interface {
	GetStats(c context.Context, tenantID string) (DashboardStats, error)
	GetRecentActivities(c context.Context, tenantID string, userID string, limit int) ([]RecentActivity, error)
}

type DashboardUsecase interface {
	GetStats(c context.Context, tenantID string) (DashboardStats, error)
	GetRecentActivities(c context.Context, tenantID string, userID string, limit int) ([]RecentActivity, error)
}
