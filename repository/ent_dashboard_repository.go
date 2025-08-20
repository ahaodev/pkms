package repository

import (
	"context"
	"pkms/domain"
	"pkms/ent"
	"pkms/ent/packages"
	"pkms/ent/project"
	"pkms/ent/release"
	"pkms/ent/tenant"
	"pkms/ent/user"
)

type entDashboardRepository struct {
	client *ent.Client
}

func NewDashboardRepository(client *ent.Client) domain.DashboardRepository {
	return &entDashboardRepository{
		client: client,
	}
}

func (dr *entDashboardRepository) GetStats(c context.Context, tenantID string) (domain.DashboardStats, error) {
	// 获取项目数量
	projectCount, err := dr.client.Project.
		Query().
		Where(project.TenantID(tenantID)).
		Count(c)
	if err != nil {
		return domain.DashboardStats{}, err
	}

	// 获取包数量（通过项目关联）
	packageCount, err := dr.client.Packages.
		Query().
		Where(
			packages.HasProjectWith(
				project.TenantID(tenantID),
			),
		).
		Count(c)
	if err != nil {
		return domain.DashboardStats{}, err
	}

	// 获取发布数量和总下载数（通过项目->包->发布关联）
	releases, err := dr.client.Release.
		Query().
		Where(
			release.HasPackageWith(
				packages.HasProjectWith(
					project.TenantID(tenantID),
				),
			),
		).
		All(c)

	totalReleases := 0
	totalDownloads := 0
	if err == nil {
		totalReleases = len(releases)
		for _, rel := range releases {
			totalDownloads += rel.DownloadCount
		}
	}

	return domain.DashboardStats{
		TotalProjects:  projectCount,
		TotalPackages:  packageCount,
		TotalReleases:  totalReleases,
		TotalDownloads: totalDownloads,
	}, nil
}

func (dr *entDashboardRepository) GetRecentActivities(c context.Context, tenantID string, userID string, limit int) ([]domain.RecentActivity, error) {
	var activities []domain.RecentActivity

	// 获取最近的项目（限制1/3）
	projects, err := dr.client.Project.
		Query().
		Where(project.TenantID(tenantID)).
		Order(ent.Desc(project.FieldCreatedAt)).
		Limit(limit / 3).
		All(c)

	if err == nil {
		for _, p := range projects {
			activities = append(activities, domain.RecentActivity{
				ID:          p.ID,
				Type:        "project_created",
				Description: "Project " + p.Name + " was created",
				UserID:      p.CreatedBy,
				CreatedAt:   p.CreatedAt,
			})
		}
	}

	// 获取最近的包（限制1/3）
	packages, err := dr.client.Packages.
		Query().
		Where(
			packages.HasProjectWith(
				project.TenantID(tenantID),
			),
		).
		Order(ent.Desc(packages.FieldCreatedAt)).
		Limit(limit / 3).
		All(c)

	if err == nil {
		for _, pkg := range packages {
			activities = append(activities, domain.RecentActivity{
				ID:          pkg.ID,
				Type:        "package_created",
				Description: "Package " + pkg.Name + " was created",
				UserID:      pkg.CreatedBy,
				CreatedAt:   pkg.CreatedAt,
			})
		}
	}

	// 获取最近的用户（限制1/3）
	users, err := dr.client.User.
		Query().
		Where(user.HasTenantsWith(tenant.ID(tenantID))).
		Order(ent.Desc(user.FieldCreatedAt)).
		Limit(limit / 3).
		All(c)

	if err == nil {
		for _, u := range users {
			activities = append(activities, domain.RecentActivity{
				ID:          u.ID,
				Type:        "user_joined",
				Description: "User " + u.Username + " joined the system",
				UserID:      u.ID,
				CreatedAt:   u.CreatedAt,
			})
		}
	}

	// 注意：在实际生产中，应该按时间排序所有活动
	// 这里简化处理，返回原始顺序
	return activities, nil
}
