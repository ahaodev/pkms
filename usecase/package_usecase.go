package usecase

import (
	"context"
	"time"

	"pkms/domain"
)

type packageUsecase struct {
	packageRepository domain.PackageRepository
	contextTimeout    time.Duration
}

func NewPackageUsecase(packageRepository domain.PackageRepository, timeout time.Duration) domain.PackageUsecase {
	return &packageUsecase{
		packageRepository: packageRepository,
		contextTimeout:    timeout,
	}
}

func (pu *packageUsecase) Create(c context.Context, pkg *domain.Package) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.packageRepository.Create(ctx, pkg)
}

func (pu *packageUsecase) Fetch(c context.Context) ([]domain.Package, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.packageRepository.Fetch(ctx)
}

func (pu *packageUsecase) GetByID(c context.Context, id string) (domain.Package, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.packageRepository.GetByID(ctx, id)
}

func (pu *packageUsecase) Update(c context.Context, pkg *domain.Package) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.packageRepository.Update(ctx, pkg)
}

func (pu *packageUsecase) Delete(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.packageRepository.Delete(ctx, id)
}

func (pu *packageUsecase) GetByProjectID(c context.Context, projectID string) ([]domain.Package, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.packageRepository.GetByProjectID(ctx, projectID)
}

func (pu *packageUsecase) GetByShareToken(c context.Context, token string) (domain.Package, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.packageRepository.GetByShareToken(ctx, token)
}
