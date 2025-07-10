package usecase

import (
	"context"
	"time"

	"pkms/domain"
)

type upgradeUsecase struct {
	upgradeRepository domain.UpgradeRepository
	packageRepository domain.PackageRepository
	contextTimeout    time.Duration
}

func NewUpgradeUsecase(upgradeRepository domain.UpgradeRepository, packageRepository domain.PackageRepository, timeout time.Duration) domain.UpgradeUsecase {
	return &upgradeUsecase{
		upgradeRepository: upgradeRepository,
		packageRepository: packageRepository,
		contextTimeout:    timeout,
	}
}

func (uu *upgradeUsecase) CheckUpgrade(c context.Context, packageID string) (domain.UpgradeInfo, error) {
	ctx, cancel := context.WithTimeout(c, uu.contextTimeout)
	defer cancel()
	return uu.upgradeRepository.CheckUpgrade(ctx, packageID)
}

func (uu *upgradeUsecase) GetUpgradeHistory(c context.Context, packageID string) ([]domain.UpgradeHistory, error) {
	ctx, cancel := context.WithTimeout(c, uu.contextTimeout)
	defer cancel()
	return uu.upgradeRepository.GetUpgradeHistory(ctx, packageID)
}

func (uu *upgradeUsecase) PerformUpgrade(c context.Context, packageID string, userID string) error {
	ctx, cancel := context.WithTimeout(c, uu.contextTimeout)
	defer cancel()

	// Get current package info
	pkg, err := uu.packageRepository.GetByID(ctx, packageID)
	if err != nil {
		return err
	}

	// Check for upgrade info
	upgradeInfo, err := uu.upgradeRepository.CheckUpgrade(ctx, packageID)
	if err != nil {
		return err
	}

	// Create upgrade history record
	history := &domain.UpgradeHistory{
		PackageID:     packageID,
		FromVersion:   pkg.Version,
		ToVersion:     upgradeInfo.LatestVersion,
		UpgradeStatus: "pending",
		UserID:        userID,
	}

	err = uu.upgradeRepository.CreateUpgradeRecord(ctx, history)
	if err != nil {
		return err
	}

	// Here you would implement the actual upgrade logic
	// For now, we'll just mark it as completed
	return uu.upgradeRepository.UpdateUpgradeStatus(ctx, history.ID, "completed")
}

func (uu *upgradeUsecase) GetAvailableUpgrades(c context.Context, projectID string) ([]domain.UpgradeInfo, error) {
	ctx, cancel := context.WithTimeout(c, uu.contextTimeout)
	defer cancel()

	// Get all packages for the project
	packages, err := uu.packageRepository.GetByProjectID(ctx, projectID)
	if err != nil {
		return nil, err
	}

	var upgrades []domain.UpgradeInfo
	for _, pkg := range packages {
		upgradeInfo, err := uu.upgradeRepository.CheckUpgrade(ctx, pkg.ID)
		if err != nil {
			continue // Skip packages that can't be checked
		}
		if upgradeInfo.UpgradeAvailable {
			upgrades = append(upgrades, upgradeInfo)
		}
	}

	return upgrades, nil
}
