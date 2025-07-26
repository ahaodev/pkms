package repository

import (
	"context"

	"pkms/domain"
	"pkms/ent"
	"pkms/ent/packages"
	"pkms/ent/project"
	"pkms/ent/release"
)

type entReleaseRepository struct {
	client *ent.Client
}

func NewReleaseRepository(client *ent.Client) domain.ReleaseRepository {
	return &entReleaseRepository{
		client: client,
	}
}

func (rr *entReleaseRepository) Create(c context.Context, r *domain.Release) error {
	createBuilder := rr.client.Release.
		Create().
		SetPackageID(r.PackageID).
		SetVersionCode(r.VersionCode).
		SetVersionName(r.VersionName).
		SetChangelog(r.ChangeLog).
		SetFilePath(r.FilePath).
		SetFileName(r.FileName).
		SetFileSize(r.FileSize).
		SetDownloadCount(r.DownloadCount).
		SetCreatedBy(r.CreatedBy)

	// 可选字段
	if r.TagName != "" {
		createBuilder = createBuilder.SetTagName(r.TagName)
	}
	if r.FileHash != "" {
		createBuilder = createBuilder.SetFileHash(r.FileHash)
	}

	created, err := createBuilder.Save(c)
	if err != nil {
		return err
	}

	r.ID = created.ID
	r.CreatedAt = created.CreatedAt
	return nil
}

func (rr *entReleaseRepository) GetByID(c context.Context, id string) (*domain.Release, error) {
	entRelease, err := rr.client.Release.
		Query().
		Where(release.ID(id)).
		Only(c)

	if err != nil {
		return nil, err
	}

	return rr.convertToDomain(entRelease), nil
}

func (rr *entReleaseRepository) GetByPackageID(c context.Context, packageID string) ([]*domain.Release, error) {
	entReleases, err := rr.client.Release.
		Query().
		Where(release.PackageID(packageID)).
		All(c)

	if err != nil {
		return nil, err
	}

	releases := make([]*domain.Release, len(entReleases))
	for i, entRelease := range entReleases {
		releases[i] = rr.convertToDomain(entRelease)
	}

	return releases, nil
}

func (rr *entReleaseRepository) GetLatestByPackageID(c context.Context, packageID string) (*domain.Release, error) {
	entRelease, err := rr.client.Release.
		Query().
		Where(
			release.PackageID(packageID),
		).
		Only(c)

	if err != nil {
		return nil, err
	}

	return rr.convertToDomain(entRelease), nil
}

func (rr *entReleaseRepository) GetByShareToken(c context.Context, token string) (*domain.Release, error) {
	entRelease, err := rr.client.Release.
		Query().
		Only(c)

	if err != nil {
		return nil, err
	}

	return rr.convertToDomain(entRelease), nil
}

func (rr *entReleaseRepository) Delete(c context.Context, id string) error {
	return rr.client.Release.DeleteOneID(id).Exec(c)
}

func (rr *entReleaseRepository) IncrementDownloadCount(c context.Context, id string) error {
	_, err := rr.client.Release.
		UpdateOneID(id).
		AddDownloadCount(1).
		Save(c)
	return err
}

func (rr *entReleaseRepository) SetAsLatest(c context.Context, packageID, releaseID string) error {
	// 先将该包的所有版本设置为非最新
	_, err := rr.client.Release.
		Update().
		Where(release.PackageID(packageID)).
		Save(c)

	if err != nil {
		return err
	}

	// 再将指定版本设置为最新
	_, err = rr.client.Release.
		UpdateOneID(releaseID).
		Save(c)

	return err
}

func (rr *entReleaseRepository) GetTotalDownloadsByTenant(c context.Context, tenantID string) (int, error) {
	// 需要通过 release -> package -> project -> tenant 的关系来过滤
	// 查询该租户下所有 release 的下载次数总和
	releases, err := rr.client.Release.
		Query().
		Where(
			release.HasPackageWith(
				packages.HasProjectWith(
					project.TenantID(tenantID),
				),
			),
		).
		All(c)

	if err != nil {
		return 0, err
	}

	totalDownloads := 0
	for _, rel := range releases {
		totalDownloads += rel.DownloadCount
	}

	return totalDownloads, nil
}

func (rr *entReleaseRepository) convertToDomain(entRelease *ent.Release) *domain.Release {
	return &domain.Release{
		ID:            entRelease.ID,
		PackageID:     entRelease.PackageID,
		VersionCode:   entRelease.VersionCode,
		TagName:       entRelease.TagName,
		VersionName:   entRelease.VersionName,
		ChangeLog:     entRelease.Changelog,
		FilePath:      entRelease.FilePath,
		FileName:      entRelease.FileName,
		FileSize:      entRelease.FileSize,
		FileHash:      entRelease.FileHash,
		DownloadCount: entRelease.DownloadCount,
		CreatedBy:     entRelease.CreatedBy,
		CreatedAt:     entRelease.CreatedAt,
	}
}
