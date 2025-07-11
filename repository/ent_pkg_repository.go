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

func (pr *entPackageRepository) GetByID(c context.Context, id string) (*domain.Package, error) {
	p, err := pr.client.Pkg.
		Query().
		Where(pkg.ID(id)).
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
			ID:          p.ID,
			ProjectID:   p.ProjectID,
			Name:        p.Name,
			Description: p.Description,
			Type:        string(p.Type),
			CreatedAt:   p.CreatedAt,
			UpdatedAt:   p.UpdatedAt,
		})
	}

	return nil, nil
}

func (pr *entPackageRepository) FetchByProject(c context.Context, projectID string, page, pageSize int) ([]*domain.Package, int, error) {
	//TODO implement me
	panic("implement me")
}

func NewPackageRepository(client *ent.Client) domain.PackageRepository {
	return &entPackageRepository{
		client: client,
	}
}

func (pr *entPackageRepository) Create(c context.Context, p *domain.Package) error {
	created, err := pr.client.Pkg.
		Create().
		SetProjectID(p.ProjectID).
		SetName(p.Name).
		SetDescription(p.Description).
		SetType(pkg.Type(p.Type)).
		Save(c)

	if err != nil {
		return err
	}

	p.ID = created.ID
	p.CreatedAt = created.CreatedAt
	p.UpdatedAt = created.UpdatedAt
	return nil
}

// 支持分页的 Fetch
func (pr *entPackageRepository) Fetch(c context.Context, page, pageSize int) ([]domain.Package, int, error) {
	offset := (page - 1) * pageSize
	if offset < 0 {
		offset = 0
	}

	total, err := pr.client.Pkg.Query().Count(c)
	if err != nil {
		return nil, 0, err
	}

	packages, err := pr.client.Pkg.
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
	_, err := pr.client.Pkg.
		UpdateOneID(p.ID).
		SetName(p.Name).
		SetDescription(p.Description).
		SetType(pkg.Type(p.Type)).
		Save(c)

	return err
}

func (pr *entPackageRepository) Delete(c context.Context, id string) error {
	return pr.client.Pkg.
		DeleteOneID(id).
		Exec(c)
}

func (pr *entPackageRepository) GetByShareToken(c context.Context, token string) (domain.Package, error) {
	p, err := pr.client.Pkg.
		Query().
		First(c)

	if err != nil {
		return domain.Package{}, err
	}

	return domain.Package{
		ID:          p.ID,
		ProjectID:   p.ProjectID,
		Name:        p.Name,
		Description: p.Description,
		Type:        string(p.Type),
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}, nil
}
