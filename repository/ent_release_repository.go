package repository

import (
	"context"

	"pkms/domain"
	"pkms/ent"
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
		SetVersion(r.Version).
		SetDescription(r.Description).
		SetFilePath(r.FilePath).
		SetFileName(r.FileName).
		SetFileSize(r.FileSize).
		SetIsLatest(r.IsLatest).
		SetDownloadCount(r.DownloadCount).
		SetCreatedBy(r.CreatedBy)

	// 可选字段
	if r.TagName != "" {
		createBuilder = createBuilder.SetTagName(r.TagName)
	}
	if r.Title != "" {
		createBuilder = createBuilder.SetTitle(r.Title)
	}
	if r.FileHash != "" {
		createBuilder = createBuilder.SetFileHash(r.FileHash)
	}
	if r.ShareToken != "" {
		createBuilder = createBuilder.SetShareToken(r.ShareToken)
	}

	if !r.PublishedAt.IsZero() {
		createBuilder = createBuilder.SetPublishedAt(r.PublishedAt)
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
			release.IsLatest(true),
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
		Where(release.ShareToken(token)).
		Only(c)

	if err != nil {
		return nil, err
	}

	return rr.convertToDomain(entRelease), nil
}

func (rr *entReleaseRepository) Update(c context.Context, r *domain.Release) error {
	updateBuilder := rr.client.Release.
		UpdateOneID(r.ID).
		SetVersion(r.Version).
		SetDescription(r.Description).
		SetFilePath(r.FilePath).
		SetFileName(r.FileName).
		SetFileSize(r.FileSize).
		SetIsLatest(r.IsLatest).
		SetDownloadCount(r.DownloadCount)

	// 可选字段
	if r.TagName != "" {
		updateBuilder = updateBuilder.SetTagName(r.TagName)
	}
	if r.Title != "" {
		updateBuilder = updateBuilder.SetTitle(r.Title)
	}
	if r.FileHash != "" {
		updateBuilder = updateBuilder.SetFileHash(r.FileHash)
	}
	if r.ShareToken != "" {
		updateBuilder = updateBuilder.SetShareToken(r.ShareToken)
	}

	if !r.PublishedAt.IsZero() {
		updateBuilder = updateBuilder.SetPublishedAt(r.PublishedAt)
	}

	_, err := updateBuilder.Save(c)
	return err
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
		SetIsLatest(false).
		Save(c)

	if err != nil {
		return err
	}

	// 再将指定版本设置为最新
	_, err = rr.client.Release.
		UpdateOneID(releaseID).
		SetIsLatest(true).
		Save(c)

	return err
}

func (rr *entReleaseRepository) convertToDomain(entRelease *ent.Release) *domain.Release {
	return &domain.Release{
		ID:            entRelease.ID,
		PackageID:     entRelease.PackageID,
		Version:       entRelease.Version,
		TagName:       entRelease.TagName,
		Title:         entRelease.Title,
		Description:   entRelease.Description,
		FilePath:      entRelease.FilePath,
		FileName:      entRelease.FileName,
		FileSize:      entRelease.FileSize,
		FileHash:      entRelease.FileHash,
		IsLatest:      entRelease.IsLatest,
		DownloadCount: entRelease.DownloadCount,
		ShareToken:    entRelease.ShareToken,
		CreatedBy:     entRelease.CreatedBy,
		CreatedAt:     entRelease.CreatedAt,
		PublishedAt:   entRelease.PublishedAt,
	}
}
