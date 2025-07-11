package usecase

import (
	"context"
	"time"

	"pkms/domain"
)

type packageUsecase struct {
	packageRepository domain.PackageRepository
	releaseRepository domain.ReleaseRepository
	contextTimeout    time.Duration
}

func NewPackageUsecase(
	packageRepository domain.PackageRepository,
	releaseRepository domain.ReleaseRepository,
	timeout time.Duration,
) domain.PackageUsecase {
	return &packageUsecase{
		packageRepository: packageRepository,
		releaseRepository: releaseRepository,
		contextTimeout:    timeout,
	}
}

// 包相关操作
func (pu *packageUsecase) CreatePackage(c context.Context, pkg *domain.Package) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.packageRepository.Create(ctx, pkg)
}

func (pu *packageUsecase) GetPackageByID(c context.Context, id string) (*domain.Package, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.packageRepository.GetByID(ctx, id)
}

func (pu *packageUsecase) GetPackagesByProject(c context.Context, projectID string, page, pageSize int) ([]*domain.Package, int, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.packageRepository.FetchByProject(ctx, projectID, page, pageSize)
}

func (pu *packageUsecase) UpdatePackage(c context.Context, pkg *domain.Package) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.packageRepository.Update(ctx, pkg)
}

func (pu *packageUsecase) DeletePackage(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.packageRepository.Delete(ctx, id)
}

// 发布版本相关操作
func (pu *packageUsecase) CreateRelease(c context.Context, release *domain.Release) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.releaseRepository.Create(ctx, release)
}

func (pu *packageUsecase) GetReleaseByID(c context.Context, id string) (*domain.Release, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.releaseRepository.GetByID(ctx, id)
}

func (pu *packageUsecase) GetReleasesByPackage(c context.Context, packageID string) ([]*domain.Release, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.releaseRepository.GetByPackageID(ctx, packageID)
}

func (pu *packageUsecase) GetLatestRelease(c context.Context, packageID string) (*domain.Release, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.releaseRepository.GetLatestByPackageID(ctx, packageID)
}

func (pu *packageUsecase) GetReleaseByShareToken(c context.Context, token string) (*domain.Release, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.releaseRepository.GetByShareToken(ctx, token)
}

func (pu *packageUsecase) UpdateRelease(c context.Context, release *domain.Release) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.releaseRepository.Update(ctx, release)
}

func (pu *packageUsecase) DeleteRelease(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.releaseRepository.Delete(ctx, id)
}

func (pu *packageUsecase) IncrementDownloadCount(c context.Context, releaseID string) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.releaseRepository.IncrementDownloadCount(ctx, releaseID)
}

func (pu *packageUsecase) SetReleaseAsLatest(c context.Context, packageID, releaseID string) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.releaseRepository.SetAsLatest(ctx, packageID, releaseID)
}
