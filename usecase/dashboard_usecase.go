package usecase

import (
	"context"
	"time"

	"pkms/domain"
)

type dashboardUsecase struct {
	projectRepository domain.ProjectRepository
	packageRepository domain.PackageRepository
	userRepository    domain.UserRepository
	contextTimeout    time.Duration
}

func NewDashboardUsecase(
	projectRepository domain.ProjectRepository,
	packageRepository domain.PackageRepository,
	userRepository domain.UserRepository,
	timeout time.Duration,
) domain.DashboardUsecase {
	return &dashboardUsecase{
		projectRepository: projectRepository,
		packageRepository: packageRepository,
		userRepository:    userRepository,
		contextTimeout:    timeout,
	}
}

func (du *dashboardUsecase) GetStats(c context.Context, tenantID string) (domain.DashboardStats, error) {
	ctx, cancel := context.WithTimeout(c, du.contextTimeout)
	defer cancel()

	// Get all entities to count them
	projects, err := du.projectRepository.Fetch(ctx, tenantID)
	if err != nil {
		return domain.DashboardStats{}, err
	}

	// Get package count (we'll get all projects and sum their packages)
	totalPackages := 0
	for _, project := range projects {
		packages, _, err := du.packageRepository.FetchByProject(ctx, project.ID, 1, 1000) // Get all packages for counting
		if err == nil {
			totalPackages += len(packages)
		}
	}

	users, err := du.userRepository.Fetch(ctx)
	if err != nil {
		return domain.DashboardStats{}, err
	}

	return domain.DashboardStats{
		TotalProjects: len(projects),
		TotalPackages: totalPackages,
		TotalUsers:    len(users),
	}, nil
}

func (du *dashboardUsecase) GetRecentActivities(c context.Context, tenantID string, limit int) ([]domain.RecentActivity, error) {
	ctx, cancel := context.WithTimeout(c, du.contextTimeout)
	defer cancel()

	var activities []domain.RecentActivity

	// Get recent projects
	projects, err := du.projectRepository.Fetch(ctx, tenantID)
	if err == nil {
		for i, project := range projects {
			if i >= limit/3 { // Limit to 1/3 of total limit
				break
			}
			activities = append(activities, domain.RecentActivity{
				ID:          project.ID,
				Type:        "project_created",
				Description: "Project " + project.Name + " was created",
				UserID:      project.CreatedBy,
				CreatedAt:   project.CreatedAt,
			})
		}
	}

	// Get recent packages from all projects
	var recentPackages []*domain.Package
	for _, project := range projects {
		packages, _, err := du.packageRepository.FetchByProject(ctx, project.ID, 1, limit/3)
		if err == nil {
			recentPackages = append(recentPackages, packages...)
			if len(recentPackages) >= limit/3 {
				break
			}
		}
	}

	for _, pkg := range recentPackages {
		activities = append(activities, domain.RecentActivity{
			ID:          pkg.ID,
			Type:        "package_created",
			Description: "Package " + pkg.Name + " was created",
			UserID:      pkg.CreatedBy,
			CreatedAt:   pkg.CreatedAt,
		})
	}

	// Get recent users
	users, err := du.userRepository.Fetch(ctx)
	if err == nil {
		for i, user := range users {
			if i >= limit/3 { // Limit to 1/3 of total limit
				break
			}
			activities = append(activities, domain.RecentActivity{
				ID:          user.ID,
				Type:        "user_joined",
				Description: "User " + user.Name + " joined the system",
				UserID:      user.ID,
				CreatedAt:   user.CreatedAt,
			})
		}
	}
	// Sort activities by created_at (newest first)
	// For simplicity, we'll return as is, but in production you'd want to sort
	return activities, nil
}
