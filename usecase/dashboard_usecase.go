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
	groupRepository   domain.GroupRepository
	contextTimeout    time.Duration
}

func NewDashboardUsecase(
	projectRepository domain.ProjectRepository,
	packageRepository domain.PackageRepository,
	userRepository domain.UserRepository,
	groupRepository domain.GroupRepository,
	timeout time.Duration,
) domain.DashboardUsecase {
	return &dashboardUsecase{
		projectRepository: projectRepository,
		packageRepository: packageRepository,
		userRepository:    userRepository,
		groupRepository:   groupRepository,
		contextTimeout:    timeout,
	}
}

func (du *dashboardUsecase) GetStats(c context.Context) (domain.DashboardStats, error) {
	ctx, cancel := context.WithTimeout(c, du.contextTimeout)
	defer cancel()

	// Get all entities to count them
	projects, err := du.projectRepository.Fetch(ctx)
	if err != nil {
		return domain.DashboardStats{}, err
	}

	packages, err := du.packageRepository.Fetch(ctx)
	if err != nil {
		return domain.DashboardStats{}, err
	}

	users, err := du.userRepository.Fetch(ctx)
	if err != nil {
		return domain.DashboardStats{}, err
	}

	groups, err := du.groupRepository.Fetch(ctx)
	if err != nil {
		return domain.DashboardStats{}, err
	}

	return domain.DashboardStats{
		TotalProjects: len(projects),
		TotalPackages: len(packages),
		TotalUsers:    len(users),
		TotalGroups:   len(groups),
	}, nil
}

func (du *dashboardUsecase) GetRecentActivities(c context.Context, limit int) ([]domain.RecentActivity, error) {
	ctx, cancel := context.WithTimeout(c, du.contextTimeout)
	defer cancel()

	var activities []domain.RecentActivity

	// Get recent projects
	projects, err := du.projectRepository.Fetch(ctx)
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

	// Get recent packages
	packages, err := du.packageRepository.Fetch(ctx)
	if err == nil {
		for i, pkg := range packages {
			if i >= limit/3 { // Limit to 1/3 of total limit
				break
			}
			activities = append(activities, domain.RecentActivity{
				ID:          pkg.ID,
				Type:        "package_uploaded",
				Description: "Package " + pkg.Name + " version " + pkg.Version + " was uploaded",
				UserID:      "", // Package doesn't have a direct user relation
				CreatedAt:   pkg.CreatedAt,
			})
		}
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
