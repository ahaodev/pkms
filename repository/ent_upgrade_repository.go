package repository

import (
	"context"
	"strings"
	"time"

	"pkms/domain"
	"pkms/ent"
	"pkms/ent/pkg"
)

type entUpgradeRepository struct {
	client *ent.Client
}

func NewUpgradeRepository(client *ent.Client) domain.UpgradeRepository {
	return &entUpgradeRepository{
		client: client,
	}
}

func (ur *entUpgradeRepository) CheckUpgrade(c context.Context, packageID string) (domain.UpgradeInfo, error) {
	// Get the current package
	currentPkg, err := ur.client.Pkg.
		Query().
		Where(pkg.ID(packageID)).
		First(c)

	if err != nil {
		return domain.UpgradeInfo{}, err
	}

	// Get the latest package with the same name in the same project
	latestPkg, err := ur.client.Pkg.
		Query().
		Where(
			pkg.ProjectID(currentPkg.ProjectID),
			pkg.Name(currentPkg.Name),
			pkg.IsLatest(true),
		).
		First(c)

	if err != nil {
		return domain.UpgradeInfo{}, err
	}

	upgradeAvailable := currentPkg.Version != latestPkg.Version
	upgradeType := determineUpgradeType(currentPkg.Version, latestPkg.Version)

	return domain.UpgradeInfo{
		ID:               generateUniqueID(),
		PackageID:        packageID,
		CurrentVersion:   currentPkg.Version,
		LatestVersion:    latestPkg.Version,
		UpgradeAvailable: upgradeAvailable,
		ChangeLog:        latestPkg.Changelog,
		ReleaseNotes:     latestPkg.Description,
		UpgradeType:      upgradeType,
		RequiredActions:  []string{}, // Could be populated based on upgrade type
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}, nil
}

func (ur *entUpgradeRepository) GetUpgradeHistory(c context.Context, packageID string) ([]domain.UpgradeHistory, error) {
	// This would require an UpgradeHistory table in ent, which doesn't exist yet
	// For now, return empty slice
	return []domain.UpgradeHistory{}, nil
}

func (ur *entUpgradeRepository) CreateUpgradeRecord(c context.Context, history *domain.UpgradeHistory) error {
	// This would require an UpgradeHistory table in ent, which doesn't exist yet
	// For now, generate an ID and return success
	if history.ID == "" {
		history.ID = generateUniqueID()
	}
	return nil
}

func (ur *entUpgradeRepository) UpdateUpgradeStatus(c context.Context, id string, status string) error {
	// This would require an UpgradeHistory table in ent, which doesn't exist yet
	// For now, return success
	return nil
}

// determineUpgradeType analyzes version strings to determine upgrade type
func determineUpgradeType(currentVersion, latestVersion string) string {
	// Simple version comparison - could be enhanced with proper semver parsing
	currentParts := strings.Split(currentVersion, ".")
	latestParts := strings.Split(latestVersion, ".")

	if len(currentParts) >= 1 && len(latestParts) >= 1 && currentParts[0] != latestParts[0] {
		return "major"
	}

	if len(currentParts) >= 2 && len(latestParts) >= 2 && currentParts[1] != latestParts[1] {
		return "minor"
	}

	return "patch"
}
