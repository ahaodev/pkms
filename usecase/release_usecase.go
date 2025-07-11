package usecase

import (
	"context"
	"time"

	"pkms/domain"
)

type releaseUsecase struct {
	releaseRepository domain.ReleaseRepository
	packageRepository domain.PackageRepository
	fileRepository    domain.FileRepository
	contextTimeout    time.Duration
}

func NewReleaseUsecase(
	releaseRepository domain.ReleaseRepository,
	packageRepository domain.PackageRepository,
	fileRepository domain.FileRepository,
	timeout time.Duration,
) domain.ReleaseUsecase {
	return &releaseUsecase{
		releaseRepository: releaseRepository,
		packageRepository: packageRepository,
		fileRepository:    fileRepository,
		contextTimeout:    timeout,
	}
}

func (ru *releaseUsecase) CreateRelease(c context.Context, release *domain.Release) error {
	ctx, cancel := context.WithTimeout(c, ru.contextTimeout)
	defer cancel()
	return ru.releaseRepository.Create(ctx, release)
}

func (ru *releaseUsecase) GetReleaseByID(c context.Context, id string) (*domain.Release, error) {
	ctx, cancel := context.WithTimeout(c, ru.contextTimeout)
	defer cancel()
	return ru.releaseRepository.GetByID(ctx, id)
}

func (ru *releaseUsecase) GetReleasesByPackage(c context.Context, packageID string) ([]*domain.Release, error) {
	ctx, cancel := context.WithTimeout(c, ru.contextTimeout)
	defer cancel()
	return ru.releaseRepository.GetByPackageID(ctx, packageID)
}

func (ru *releaseUsecase) GetLatestRelease(c context.Context, packageID string) (*domain.Release, error) {
	ctx, cancel := context.WithTimeout(c, ru.contextTimeout)
	defer cancel()
	return ru.releaseRepository.GetLatestByPackageID(ctx, packageID)
}

func (ru *releaseUsecase) GetReleaseByShareToken(c context.Context, token string) (*domain.Release, error) {
	ctx, cancel := context.WithTimeout(c, ru.contextTimeout)
	defer cancel()
	return ru.releaseRepository.GetByShareToken(ctx, token)
}

func (ru *releaseUsecase) UpdateRelease(c context.Context, release *domain.Release) error {
	ctx, cancel := context.WithTimeout(c, ru.contextTimeout)
	defer cancel()
	return ru.releaseRepository.Update(ctx, release)
}

func (ru *releaseUsecase) DeleteRelease(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, ru.contextTimeout)
	defer cancel()
	return ru.releaseRepository.Delete(ctx, id)
}

func (ru *releaseUsecase) IncrementDownloadCount(c context.Context, releaseID string) error {
	ctx, cancel := context.WithTimeout(c, ru.contextTimeout)
	defer cancel()
	return ru.releaseRepository.IncrementDownloadCount(ctx, releaseID)
}

func (ru *releaseUsecase) SetAsLatest(c context.Context, packageID, releaseID string) error {
	ctx, cancel := context.WithTimeout(c, ru.contextTimeout)
	defer cancel()
	return ru.releaseRepository.SetAsLatest(ctx, packageID, releaseID)
}

func (ru *releaseUsecase) PublishRelease(c context.Context, releaseID string) error {
	ctx, cancel := context.WithTimeout(c, ru.contextTimeout)
	defer cancel()

	// 获取发布版本
	release, err := ru.releaseRepository.GetByID(ctx, releaseID)
	if err != nil {
		return err
	}

	// 设置为已发布状态
	now := time.Now()
	release.IsDraft = false
	release.PublishedAt = now

	// 如果是该包的第一个发布版本，自动设置为最新版本
	releases, err := ru.releaseRepository.GetByPackageID(ctx, release.PackageID)
	if err != nil {
		return err
	}

	hasPublished := false
	for _, r := range releases {
		if !r.IsDraft && r.ID != releaseID {
			hasPublished = true
			break
		}
	}

	if !hasPublished {
		release.IsLatest = true
	}

	return ru.releaseRepository.Update(ctx, release)
}
