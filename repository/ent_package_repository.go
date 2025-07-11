package repository

import (
	"context"

	"pkms/domain"
	"pkms/ent"
	"pkms/ent/pkg"
)

type entPackageRepository struct {
	client *ent.Client
}

func NewPackageRepository(client *ent.Client) domain.PackageRepository {
	return &entPackageRepository{
		client: client,
	}
}

func (pr *entPackageRepository) Create(c context.Context, p *domain.Package) error {
	// Generate a unique ID if not provided
	if p.ID == "" {
		p.ID = generateUniqueID()
	}

	created, err := pr.client.Pkg.
		Create().
		SetID(p.ID).
		SetProjectID(p.ProjectID).
		SetName(p.Name).
		SetDescription(p.Description).
		SetType(pkg.Type(p.Type)).
		SetVersion(p.Version).
		SetFileURL(p.FileURL).
		SetFileName(p.FileName).
		SetFileSize(p.FileSize).
		SetChecksum(p.Checksum).
		SetChangelog(p.Changelog).
		SetIsLatest(p.IsLatest).
		SetDownloadCount(p.DownloadCount).
		SetVersionCode(p.VersionCode).
		SetShareToken(p.ShareToken).
		SetShareExpiry(p.ShareExpiry).
		SetIsPublic(p.IsPublic).
		Save(c)

	if err != nil {
		return err
	}

	p.ID = created.ID
	p.CreatedAt = created.CreatedAt
	p.UpdatedAt = created.UpdatedAt
	return nil
}

func (pr *entPackageRepository) Fetch(c context.Context) ([]domain.Package, error) {
	packages, err := pr.client.Pkg.
		Query().
		All(c)

	if err != nil {
		return nil, err
	}

	var result []domain.Package
	for _, p := range packages {
		result = append(result, domain.Package{
			ID:            p.ID,
			ProjectID:     p.ProjectID,
			Name:          p.Name,
			Description:   p.Description,
			Type:          string(p.Type),
			Version:       p.Version,
			FileURL:       p.FileURL,
			FileName:      p.FileName,
			FileSize:      p.FileSize,
			Checksum:      p.Checksum,
			Changelog:     p.Changelog,
			IsLatest:      p.IsLatest,
			DownloadCount: p.DownloadCount,
			CreatedAt:     p.CreatedAt,
			UpdatedAt:     p.UpdatedAt,
			VersionCode:   p.VersionCode,
			ShareToken:    p.ShareToken,
			ShareExpiry:   p.ShareExpiry,
			IsPublic:      p.IsPublic,
		})
	}

	return result, nil
}

func (pr *entPackageRepository) GetByID(c context.Context, id string) (domain.Package, error) {
	p, err := pr.client.Pkg.
		Query().
		Where(pkg.ID(id)).
		First(c)

	if err != nil {
		return domain.Package{}, err
	}

	return domain.Package{
		ID:            p.ID,
		ProjectID:     p.ProjectID,
		Name:          p.Name,
		Description:   p.Description,
		Type:          string(p.Type),
		Version:       p.Version,
		FileURL:       p.FileURL,
		FileName:      p.FileName,
		FileSize:      p.FileSize,
		Checksum:      p.Checksum,
		Changelog:     p.Changelog,
		IsLatest:      p.IsLatest,
		DownloadCount: p.DownloadCount,
		CreatedAt:     p.CreatedAt,
		UpdatedAt:     p.UpdatedAt,
		VersionCode:   p.VersionCode,
		ShareToken:    p.ShareToken,
		ShareExpiry:   p.ShareExpiry,
		IsPublic:      p.IsPublic,
	}, nil
}

func (pr *entPackageRepository) Update(c context.Context, p *domain.Package) error {
	_, err := pr.client.Pkg.
		UpdateOneID(p.ID).
		SetName(p.Name).
		SetDescription(p.Description).
		SetType(pkg.Type(p.Type)).
		SetVersion(p.Version).
		SetFileURL(p.FileURL).
		SetFileName(p.FileName).
		SetFileSize(p.FileSize).
		SetChecksum(p.Checksum).
		SetChangelog(p.Changelog).
		SetIsLatest(p.IsLatest).
		SetDownloadCount(p.DownloadCount).
		SetVersionCode(p.VersionCode).
		SetShareToken(p.ShareToken).
		SetShareExpiry(p.ShareExpiry).
		SetIsPublic(p.IsPublic).
		Save(c)

	return err
}

func (pr *entPackageRepository) Delete(c context.Context, id string) error {
	return pr.client.Pkg.
		DeleteOneID(id).
		Exec(c)
}

func (pr *entPackageRepository) GetByProjectID(c context.Context, projectID string) ([]domain.Package, error) {
	packages, err := pr.client.Pkg.
		Query().
		Where(pkg.ProjectID(projectID)).
		All(c)

	if err != nil {
		return nil, err
	}

	var result []domain.Package
	for _, p := range packages {
		result = append(result, domain.Package{
			ID:            p.ID,
			ProjectID:     p.ProjectID,
			Name:          p.Name,
			Description:   p.Description,
			Type:          string(p.Type),
			Version:       p.Version,
			FileURL:       p.FileURL,
			FileName:      p.FileName,
			FileSize:      p.FileSize,
			Checksum:      p.Checksum,
			Changelog:     p.Changelog,
			IsLatest:      p.IsLatest,
			DownloadCount: p.DownloadCount,
			CreatedAt:     p.CreatedAt,
			UpdatedAt:     p.UpdatedAt,
			VersionCode:   p.VersionCode,
			ShareToken:    p.ShareToken,
			ShareExpiry:   p.ShareExpiry,
			IsPublic:      p.IsPublic,
		})
	}

	return result, nil
}

func (pr *entPackageRepository) GetByShareToken(c context.Context, token string) (domain.Package, error) {
	p, err := pr.client.Pkg.
		Query().
		Where(pkg.ShareToken(token)).
		First(c)

	if err != nil {
		return domain.Package{}, err
	}

	return domain.Package{
		ID:            p.ID,
		ProjectID:     p.ProjectID,
		Name:          p.Name,
		Description:   p.Description,
		Type:          string(p.Type),
		Version:       p.Version,
		FileURL:       p.FileURL,
		FileName:      p.FileName,
		FileSize:      p.FileSize,
		Checksum:      p.Checksum,
		Changelog:     p.Changelog,
		IsLatest:      p.IsLatest,
		DownloadCount: p.DownloadCount,
		CreatedAt:     p.CreatedAt,
		UpdatedAt:     p.UpdatedAt,
		VersionCode:   p.VersionCode,
		ShareToken:    p.ShareToken,
		ShareExpiry:   p.ShareExpiry,
		IsPublic:      p.IsPublic,
	}, nil
}
