package repository

import (
	"context"

	"pkms/domain"
	"pkms/ent"
	"pkms/ent/packages"
)

type entPackageRepository struct {
	client *ent.Client
}

func (pr *entPackageRepository) GetByID(c context.Context, id string) (*domain.Package, error) {
	p, err := pr.client.Packages.
		Query().
		Where(packages.ID(id)).
		First(c)

	if err != nil {
		return &domain.Package{}, err
	}

	return &domain.Package{
		ID:          p.ID,
		ProjectID:   p.ProjectID,
		Name:        p.Name,
		Description: p.Description,
		Type:        string(p.Type),
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}, nil
}

func (pr *entPackageRepository) GetByProjectID(c context.Context, projectID string) ([]*domain.Package, error) {
	packages, err := pr.client.Packages.
		Query().
		Where(packages.ProjectID(projectID)).
		All(c)

	if err != nil {
		return nil, err
	}

	var result []*domain.Package
	for _, p := range packages {
		result = append(result, &domain.Package{
			ID:          p.ID,
			ProjectID:   p.ProjectID,
			Name:        p.Name,
			Description: p.Description,
			Type:        string(p.Type),
			CreatedAt:   p.CreatedAt,
			UpdatedAt:   p.UpdatedAt,
		})
	}

	return result, nil
}

func (pr *entPackageRepository) FetchByProject(c context.Context, projectID string, page, pageSize int) ([]*domain.Package, int, error) {
	offset := (page - 1) * pageSize
	if offset < 0 {
		offset = 0
	}

	total, err := pr.client.Packages.
		Query().
		Where(packages.ProjectID(projectID)).
		Count(c)
	if err != nil {
		return nil, 0, err
	}

	pkgs, err := pr.client.Packages.
		Query().
		Where(packages.ProjectID(projectID)).
		Limit(pageSize).
		Offset(offset).
		All(c)
	if err != nil {
		return nil, 0, err
	}

	var result []*domain.Package
	for _, p := range pkgs {
		result = append(result, &domain.Package{
			ID:          p.ID,
			ProjectID:   p.ProjectID,
			Name:        p.Name,
			Description: p.Description,
			Type:        string(p.Type),
			CreatedAt:   p.CreatedAt,
			UpdatedAt:   p.UpdatedAt,
		})
	}

	return result, total, nil
}

func NewPackageRepository(client *ent.Client) domain.PackageRepository {
	return &entPackageRepository{
		client: client,
	}
}

func (pr *entPackageRepository) Create(c context.Context, p *domain.Package) error {
	created, err := pr.client.Packages.
		Create().
		SetProjectID(p.ProjectID).
		SetName(p.Name).
		SetDescription(p.Description).
		SetCreatedBy(p.CreatedBy).
		SetType(packages.Type(p.Type)).
		Save(c)

	if err != nil {
		return err
	}

	p.ID = created.ID
	p.CreatedAt = created.CreatedAt
	p.UpdatedAt = created.UpdatedAt
	return nil
}

func (pr *entPackageRepository) Fetch(c context.Context, page, pageSize int) ([]domain.Package, int, error) {
	offset := (page - 1) * pageSize
	if offset < 0 {
		offset = 0
	}

	total, err := pr.client.Packages.Query().Count(c)
	if err != nil {
		return nil, 0, err
	}

	packages, err := pr.client.Packages.
		Query().
		Limit(pageSize).
		Offset(offset).
		All(c)
	if err != nil {
		return nil, 0, err
	}

	var result []domain.Package
	for _, p := range packages {
		result = append(result, domain.Package{
			ID:          p.ID,
			ProjectID:   p.ProjectID,
			Name:        p.Name,
			Description: p.Description,
			Type:        string(p.Type),
			CreatedAt:   p.CreatedAt,
			UpdatedAt:   p.UpdatedAt,
		})
	}

	return result, total, nil
}

func (pr *entPackageRepository) Update(c context.Context, p *domain.Package) error {
	_, err := pr.client.Packages.
		UpdateOneID(p.ID).
		SetName(p.Name).
		SetDescription(p.Description).
		SetType(packages.Type(p.Type)).
		Save(c)

	return err
}

func (pr *entPackageRepository) Delete(c context.Context, id string) error {
	return pr.client.Packages.
		DeleteOneID(id).
		Exec(c)
}
