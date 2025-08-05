package usecase

import (
	"context"
	"pkms/bootstrap"
	"pkms/pkg"
	"time"

	"pkms/domain"
)

type releaseUsecase struct {
	releaseRepository domain.ReleaseRepository
	packageRepository domain.PackageRepository
	fileRepository    domain.FileRepository
	env               *bootstrap.Env
	contextTimeout    time.Duration
}

func NewReleaseUsecase(
	releaseRepository domain.ReleaseRepository,
	packageRepository domain.PackageRepository,
	fileRepository domain.FileRepository,
	env *bootstrap.Env,
	timeout time.Duration,
) domain.ReleaseUsecase {
	return &releaseUsecase{
		releaseRepository: releaseRepository,
		packageRepository: packageRepository,
		fileRepository:    fileRepository,
		env:               env,
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

func (ru *releaseUsecase) DeleteRelease(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, ru.contextTimeout)
	defer cancel()

	// 获取发布版本信息，用于删除关联的文件
	release, err := ru.releaseRepository.GetByID(ctx, id)
	if err != nil {
		return err
	}

	// 删除存储中的文件
	if release.FilePath != "" {
		if err := ru.fileRepository.Delete(ctx, ru.env.S3Bucket, release.FilePath); err != nil {
			// 记录错误但不阻止删除操作，因为文件可能已经不存在
			// 继续删除数据库记录
			pkg.Log.Printf("Failed to delete file %s: %v", release.FilePath, err)
		}
	}

	// 删除数据库记录（包括相关的shares和upgrades会被级联删除）
	return ru.releaseRepository.Delete(ctx, id)
}

func (ru *releaseUsecase) IncrementDownloadCount(c context.Context, releaseID string) error {
	ctx, cancel := context.WithTimeout(c, ru.contextTimeout)
	defer cancel()
	return ru.releaseRepository.IncrementDownloadCount(ctx, releaseID)
}
