package usecase

import (
	"context"
	"time"

	"pkms/domain"
)

type projectUsecase struct {
	projectRepository domain.ProjectRepository
	contextTimeout    time.Duration
}

func NewProjectUsecase(projectRepository domain.ProjectRepository, timeout time.Duration) domain.ProjectUsecase {
	return &projectUsecase{
		projectRepository: projectRepository,
		contextTimeout:    timeout,
	}
}

func (pu *projectUsecase) Create(c context.Context, project *domain.Project) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.projectRepository.Create(ctx, project)
}

func (pu *projectUsecase) Fetch(c context.Context) ([]domain.Project, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.projectRepository.Fetch(ctx)
}

func (pu *projectUsecase) GetByID(c context.Context, id string) (domain.Project, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.projectRepository.GetByID(ctx, id)
}

func (pu *projectUsecase) Update(c context.Context, project *domain.Project) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.projectRepository.Update(ctx, project)
}

func (pu *projectUsecase) Delete(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.projectRepository.Delete(ctx, id)
}

func (pu *projectUsecase) GetByUserID(c context.Context, userID string) ([]domain.Project, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.projectRepository.GetByUserID(ctx, userID)
}
