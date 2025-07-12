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
		SetCreatedBy(p.CreatedBy).
		SetUpdatedAt(p.UpdatedAt).
		SetPackageCount(p.PackageCount).
		Save(c)

	if err != nil {
		return err
	}

	p.ID = created.ID
	p.CreatedAt = created.CreatedAt
	p.UpdatedAt = created.UpdatedAt
	return nil
}

func (pr *entProjectRepository) Fetch(c context.Context) ([]domain.Project, error) {
	projects, err := pr.client.Project.
		Query().
		All(c)

	if err != nil {
		return nil, err
	}

	var result []domain.Project
	for _, p := range projects {
		result = append(result, domain.Project{
			ID:           p.ID,
			Name:         p.Name,
			Description:  p.Description,
			Icon:         p.Icon,
			CreatedAt:    p.CreatedAt,
			UpdatedAt:    p.UpdatedAt,
			PackageCount: p.PackageCount,
			CreatedBy:    p.CreatedBy,
		})
	}

	return result, nil
}

func (pr *entProjectRepository) GetByID(c context.Context, id string) (domain.Project, error) {
	p, err := pr.client.Project.
		Query().
		Where(project.ID(id)).
		First(c)

	if err != nil {
		return domain.Project{}, err
	}

	return domain.Project{
		ID:           p.ID,
		Name:         p.Name,
		Description:  p.Description,
		Icon:         p.Icon,
		CreatedAt:    p.CreatedAt,
		UpdatedAt:    p.UpdatedAt,
		PackageCount: p.PackageCount,
		CreatedBy:    p.CreatedBy,
	}, nil
}

func (pr *entProjectRepository) Update(c context.Context, p *domain.Project) error {
	_, err := pr.client.Project.
		UpdateOneID(p.ID).
		SetName(p.Name).
		SetDescription(p.Description).
		SetIcon(p.Icon).
		SetPackageCount(p.PackageCount).
		Save(c)

	return err
}

func (pr *entProjectRepository) Delete(c context.Context, id string) error {
	return pr.client.Project.
		DeleteOneID(id).
		Exec(c)
}

func (pr *entProjectRepository) GetByUserID(c context.Context, userID string) ([]domain.Project, error) {
	projects, err := pr.client.Project.
		Query().
		Where(project.CreatedBy(userID)).
		All(c)

	if err != nil {
		return nil, err
	}

	var result []domain.Project
	for _, p := range projects {
		result = append(result, domain.Project{
			ID:           p.ID,
			Name:         p.Name,
			Description:  p.Description,
			Icon:         p.Icon,
			CreatedAt:    p.CreatedAt,
			UpdatedAt:    p.UpdatedAt,
			PackageCount: p.PackageCount,
			CreatedBy:    p.CreatedBy,
		})
	}

	return result, nil
}
