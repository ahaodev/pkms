package repository

import (
	"context"

	"pkms/domain"
	"pkms/ent"
	"pkms/ent/project"
)

type entProjectRepository struct {
	client *ent.Client
}

func NewProjectRepository(client *ent.Client) domain.ProjectRepository {
	return &entProjectRepository{
		client: client,
	}
}

func (pr *entProjectRepository) Create(c context.Context, p *domain.Project) error {

	created, err := pr.client.Project.
		Create().
		SetName(p.Name).
		SetDescription(p.Description).
		SetIcon(p.Icon).
		SetTenantID(p.TenantID).
		SetCreatedBy(p.CreatedBy).
		SetUpdatedAt(p.UpdatedAt).
		Save(c)

	if err != nil {
		return err
	}

	p.ID = created.ID
	p.CreatedAt = created.CreatedAt
	p.UpdatedAt = created.UpdatedAt
	return nil
}

func (pr *entProjectRepository) Fetch(c context.Context, tenantID string) ([]*domain.Project, error) {
	projects, err := pr.client.Project.
		Query().
		Where(project.TenantID(tenantID)).
		WithPackages().
		All(c)

	if err != nil {
		return nil, err
	}

	var result []*domain.Project
	for _, p := range projects {
		result = append(result, &domain.Project{
			ID:           p.ID,
			Name:         p.Name,
			Description:  p.Description,
			Icon:         p.Icon,
			CreatedAt:    p.CreatedAt,
			UpdatedAt:    p.UpdatedAt,
			CreatedBy:    p.CreatedBy,
			TenantID:     p.TenantID,
			PackageCount: len(p.Edges.Packages),
		})
	}

	return result, nil
}

func (pr *entProjectRepository) FetchAll(c context.Context) ([]*domain.Project, error) {
	projects, err := pr.client.Project.
		Query().
		WithPackages().
		All(c)

	if err != nil {
		return nil, err
	}

	var result []*domain.Project
	for _, p := range projects {
		result = append(result, &domain.Project{
			ID:           p.ID,
			Name:         p.Name,
			Description:  p.Description,
			Icon:         p.Icon,
			TenantID:     p.TenantID,
			CreatedAt:    p.CreatedAt,
			UpdatedAt:    p.UpdatedAt,
			CreatedBy:    p.CreatedBy,
			PackageCount: len(p.Edges.Packages),
		})
	}

	return result, nil
}

func (pr *entProjectRepository) GetByID(c context.Context, id string) (*domain.Project, error) {
	p, err := pr.client.Project.
		Query().
		Where(project.ID(id)).
		WithPackages().
		First(c)

	if err != nil {
		return nil, err
	}

	return &domain.Project{
		ID:           p.ID,
		Name:         p.Name,
		Description:  p.Description,
		Icon:         p.Icon,
		CreatedAt:    p.CreatedAt,
		UpdatedAt:    p.UpdatedAt,
		CreatedBy:    p.CreatedBy,
		TenantID:     p.TenantID,
		PackageCount: len(p.Edges.Packages),
	}, nil
}

func (pr *entProjectRepository) Update(c context.Context, p *domain.Project) error {
	_, err := pr.client.Project.
		UpdateOneID(p.ID).
		SetName(p.Name).
		SetDescription(p.Description).
		SetIcon(p.Icon).
		Save(c)

	return err
}

func (pr *entProjectRepository) Delete(c context.Context, id string) error {
	return pr.client.Project.
		DeleteOneID(id).
		Exec(c)
}

func (pr *entProjectRepository) GetByUserID(c context.Context, userID string) ([]*domain.Project, error) {
	projects, err := pr.client.Project.
		Query().
		Where(project.CreatedBy(userID)).
		WithPackages().
		All(c)

	if err != nil {
		return nil, err
	}

	var result []*domain.Project
	for _, p := range projects {
		result = append(result, &domain.Project{
			ID:           p.ID,
			Name:         p.Name,
			Description:  p.Description,
			Icon:         p.Icon,
			TenantID:     p.TenantID,
			CreatedAt:    p.CreatedAt,
			UpdatedAt:    p.UpdatedAt,
			CreatedBy:    p.CreatedBy,
			PackageCount: len(p.Edges.Packages),
		})
	}

	return result, nil
}
