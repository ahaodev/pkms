package usecase

import (
	"context"
	"errors"
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

func (pu *packageUsecase) GetAllPackages(c context.Context, page, pageSize int) ([]*domain.Package, int, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.packageRepository.FetchAll(ctx, page, pageSize)
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

	// 检查包是否存在releases
	releases, err := pu.releaseRepository.GetByPackageID(ctx, id)
	if err != nil {
		return err
	}

	// 如果包有releases，则不允许删除
	if len(releases) > 0 {
		return errors.New("release is not empty")
	}

	return pu.packageRepository.Delete(ctx, id)
}

func (pu *packageUsecase) GetLatestRelease(c context.Context, packageID string) (*domain.Release, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.releaseRepository.GetLatestByPackageID(ctx, packageID)
}

func (pu *packageUsecase) IncrementDownloadCount(c context.Context, releaseID string) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.releaseRepository.IncrementDownloadCount(ctx, releaseID)
}
