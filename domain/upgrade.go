package domain

import (
	"context"
	"time"
)

type UpgradeInfo struct {
	ID               string    `json:"id"`
	PackageID        string    `json:"package_id"`
	CurrentVersion   string    `json:"current_version"`
	LatestVersion    string    `json:"latest_version"`
	UpgradeAvailable bool      `json:"upgrade_available"`
	ChangeLog        string    `json:"changelog"`
	ReleaseNotes     string    `json:"release_notes"`
	UpgradeType      string    `json:"upgrade_type"` // "major", "minor", "patch"
	RequiredActions  []string  `json:"required_actions"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type UpgradeHistory struct {
	ID            string    `json:"id"`
	PackageID     string    `json:"package_id"`
	FromVersion   string    `json:"from_version"`
	ToVersion     string    `json:"to_version"`
	UpgradeStatus string    `json:"upgrade_status"` // "pending", "in_progress", "completed", "failed"
	UserID        string    `json:"user_id"`
	CreatedAt     time.Time `json:"created_at"`
	CompletedAt   time.Time `json:"completed_at"`
}

type UpgradeRepository interface {
	CheckUpgrade(c context.Context, packageID string) (UpgradeInfo, error)
	GetUpgradeHistory(c context.Context, packageID string) ([]UpgradeHistory, error)
	CreateUpgradeRecord(c context.Context, history *UpgradeHistory) error
	UpdateUpgradeStatus(c context.Context, id string, status string) error
}

type UpgradeUsecase interface {
	CheckUpgrade(c context.Context, packageID string) (UpgradeInfo, error)
	GetUpgradeHistory(c context.Context, packageID string) ([]UpgradeHistory, error)
	PerformUpgrade(c context.Context, packageID string, userID string) error
	GetAvailableUpgrades(c context.Context, projectID string) ([]UpgradeInfo, error)
}
