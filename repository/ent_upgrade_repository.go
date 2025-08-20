package repository

import (
	"context"
	"fmt"

	"pkms/domain"
	"pkms/ent"
	"pkms/ent/upgrade"
)

type entUpgradeRepository struct {
	client *ent.Client
}

func NewUpgradeRepository(client *ent.Client) domain.UpgradeRepository {
	return &entUpgradeRepository{
		client: client,
	}
}

func (r *entUpgradeRepository) CreateUpgradeTarget(ctx context.Context, upgradeTarget *domain.UpgradeTarget) error {
	created, err := r.client.Upgrade.
		Create().
		SetTenantID(upgradeTarget.TenantID).
		SetProjectID(upgradeTarget.ProjectID).
		SetPackageID(upgradeTarget.PackageID).
		SetReleaseID(upgradeTarget.ReleaseID).
		SetName(upgradeTarget.Name).
		SetDescription(upgradeTarget.Description).
		SetIsActive(upgradeTarget.IsActive).
		SetCreatedBy(upgradeTarget.CreatedBy).
		Save(ctx)

	if err != nil {
		return err
	}

	upgradeTarget.ID = created.ID
	upgradeTarget.CreatedAt = created.CreatedAt
	upgradeTarget.UpdatedAt = created.UpdatedAt
	return nil
}

func (r *entUpgradeRepository) GetUpgradeTargetByID(ctx context.Context, id string) (*domain.UpgradeTarget, error) {
	u, err := r.client.Upgrade.
		Query().
		Where(upgrade.ID(id)).
		WithProject().
		WithPackage().
		WithRelease().
		First(ctx)

	if err != nil {
		return nil, err
	}

	target := &domain.UpgradeTarget{
		ID:          u.ID,
		TenantID:    u.TenantID,
		ProjectID:   u.ProjectID,
		PackageID:   u.PackageID,
		ReleaseID:   u.ReleaseID,
		Name:        u.Name,
		Description: u.Description,
		IsActive:    u.IsActive,
		CreatedBy:   u.CreatedBy,
		CreatedAt:   u.CreatedAt,
		UpdatedAt:   u.UpdatedAt,
	}

	// 填充关联信息
	if u.Edges.Project != nil {
		target.ProjectName = u.Edges.Project.Name
	}
	if u.Edges.Package != nil {
		target.PackageName = u.Edges.Package.Name
		target.PackageType = u.Edges.Package.Type.String()
	}
	if u.Edges.Release != nil {
		target.Version = u.Edges.Release.VersionCode
		target.FileName = u.Edges.Release.FileName
		target.FileSize = u.Edges.Release.FileSize
		target.FileHash = u.Edges.Release.FileHash
		// 构造下载URL，这里需要根据实际文件存储方案调整
		target.DownloadURL = fmt.Sprintf("/api/files/download/%s", u.Edges.Release.ID)
	}

	return target, nil
}

func (r *entUpgradeRepository) GetUpgradeTargets(ctx context.Context, tenantID string, filters map[string]interface{}) ([]*domain.UpgradeTarget, error) {
	query := r.client.Upgrade.
		Query().
		Where(upgrade.TenantID(tenantID)).
		WithProject().
		WithPackage().
		WithRelease().
		Order(ent.Desc(upgrade.FieldCreatedAt)) // 按创建时间降序排列

	// 应用过滤条件
	if projectID, ok := filters["project_id"].(string); ok && projectID != "" {
		query = query.Where(upgrade.ProjectID(projectID))
	}
	if packageID, ok := filters["package_id"].(string); ok && packageID != "" {
		query = query.Where(upgrade.PackageID(packageID))
	}
	if isActive, ok := filters["is_active"].(bool); ok {
		query = query.Where(upgrade.IsActive(isActive))
	}

	upgrades, err := query.All(ctx)
	if err != nil {
		return nil, err
	}

	var result []*domain.UpgradeTarget
	for _, u := range upgrades {
		target := &domain.UpgradeTarget{
			ID:          u.ID,
			TenantID:    u.TenantID,
			ProjectID:   u.ProjectID,
			PackageID:   u.PackageID,
			ReleaseID:   u.ReleaseID,
			Name:        u.Name,
			Description: u.Description,
			IsActive:    u.IsActive,
			CreatedBy:   u.CreatedBy,
			CreatedAt:   u.CreatedAt,
			UpdatedAt:   u.UpdatedAt,
		}

		// 填充关联信息
		if u.Edges.Project != nil {
			target.ProjectName = u.Edges.Project.Name
		}
		if u.Edges.Package != nil {
			target.PackageName = u.Edges.Package.Name
			target.PackageType = u.Edges.Package.Type.String()
		}
		if u.Edges.Release != nil {
			target.Version = u.Edges.Release.VersionCode
			target.FileName = u.Edges.Release.FileName
			target.FileSize = u.Edges.Release.FileSize
			target.FileHash = u.Edges.Release.FileHash
			target.DownloadURL = fmt.Sprintf("/api/files/download/%s", u.Edges.Release.ID)
		}

		result = append(result, target)
	}

	return result, nil
}

func (r *entUpgradeRepository) GetUpgradeTargetsPaged(ctx context.Context, tenantID string, filters map[string]interface{}, params domain.QueryParams) (*domain.UpgradeTargetPagedResult, error) {
	query := r.client.Upgrade.
		Query().
		Where(upgrade.TenantID(tenantID)).
		WithProject().
		WithPackage().
		WithRelease().
		Order(ent.Desc(upgrade.FieldCreatedAt)) // 按创建时间降序排列

	// 应用过滤条件
	if projectID, ok := filters["project_id"].(string); ok && projectID != "" {
		query = query.Where(upgrade.ProjectID(projectID))
	}
	if packageID, ok := filters["package_id"].(string); ok && packageID != "" {
		query = query.Where(upgrade.PackageID(packageID))
	}
	if isActive, ok := filters["is_active"].(bool); ok {
		query = query.Where(upgrade.IsActive(isActive))
	}

	// 获取总数
	total, err := query.Clone().Count(ctx)
	if err != nil {
		return nil, err
	}

	// 应用分页
	offset := (params.Page - 1) * params.PageSize
	upgrades, err := query.Offset(offset).Limit(params.PageSize).All(ctx)
	if err != nil {
		return nil, err
	}

	var result []*domain.UpgradeTarget
	for _, u := range upgrades {
		target := &domain.UpgradeTarget{
			ID:          u.ID,
			TenantID:    u.TenantID,
			ProjectID:   u.ProjectID,
			PackageID:   u.PackageID,
			ReleaseID:   u.ReleaseID,
			Name:        u.Name,
			Description: u.Description,
			IsActive:    u.IsActive,
			CreatedBy:   u.CreatedBy,
			CreatedAt:   u.CreatedAt,
			UpdatedAt:   u.UpdatedAt,
		}

		// 填充关联信息
		if u.Edges.Project != nil {
			target.ProjectName = u.Edges.Project.Name
		}
		if u.Edges.Package != nil {
			target.PackageName = u.Edges.Package.Name
			target.PackageType = u.Edges.Package.Type.String()
		}
		if u.Edges.Release != nil {
			target.Version = u.Edges.Release.VersionCode
			target.FileName = u.Edges.Release.FileName
			target.FileSize = u.Edges.Release.FileSize
			target.FileHash = u.Edges.Release.FileHash
			target.DownloadURL = fmt.Sprintf("/api/files/download/%s", u.Edges.Release.ID)
		}

		result = append(result, target)
	}

	return domain.NewPagedResult(result, total, params.Page, params.PageSize), nil
}

func (r *entUpgradeRepository) UpdateUpgradeTarget(ctx context.Context, id string, updates map[string]interface{}) error {
	query := r.client.Upgrade.UpdateOneID(id)

	if name, ok := updates["name"].(string); ok {
		query = query.SetName(name)
	}
	if description, ok := updates["description"].(string); ok {
		query = query.SetDescription(description)
	}
	if isActive, ok := updates["is_active"].(bool); ok {
		query = query.SetIsActive(isActive)
	}

	_, err := query.Save(ctx)
	return err
}

func (r *entUpgradeRepository) DeleteUpgradeTarget(ctx context.Context, id string) error {
	return r.client.Upgrade.
		DeleteOneID(id).
		Exec(ctx)
}

func (r *entUpgradeRepository) GetActiveUpgradeTargetByPackageID(ctx context.Context, packageID string) (*domain.UpgradeTarget, error) {
	u, err := r.client.Upgrade.
		Query().
		Where(
			upgrade.PackageID(packageID),
			upgrade.IsActive(true),
		).
		WithProject().
		WithPackage().
		WithRelease().
		First(ctx)

	if err != nil {
		return nil, err
	}

	target := &domain.UpgradeTarget{
		ID:          u.ID,
		TenantID:    u.TenantID,
		ProjectID:   u.ProjectID,
		PackageID:   u.PackageID,
		ReleaseID:   u.ReleaseID,
		Name:        u.Name,
		Description: u.Description,
		IsActive:    u.IsActive,
		CreatedBy:   u.CreatedBy,
		CreatedAt:   u.CreatedAt,
		UpdatedAt:   u.UpdatedAt,
	}

	// 填充关联信息
	if u.Edges.Project != nil {
		target.ProjectName = u.Edges.Project.Name
	}
	if u.Edges.Package != nil {
		target.PackageName = u.Edges.Package.Name
		target.PackageType = u.Edges.Package.Type.String()
	}
	if u.Edges.Release != nil {
		target.Version = u.Edges.Release.VersionCode
		target.FileName = u.Edges.Release.FileName
		target.FileSize = u.Edges.Release.FileSize
		target.FileHash = u.Edges.Release.FileHash
		target.DownloadURL = fmt.Sprintf("/client-access/download/%s", u.Edges.Release.ID)
	}

	return target, nil
}

func (r *entUpgradeRepository) CheckProjectUpgradeTargets(ctx context.Context, projectID string, packageIDs []string) (map[string]*domain.UpgradeTarget, error) {
	upgrades, err := r.client.Upgrade.
		Query().
		Where(
			upgrade.ProjectID(projectID),
			upgrade.PackageIDIn(packageIDs...),
			upgrade.IsActive(true),
		).
		WithProject().
		WithPackage().
		WithRelease().
		All(ctx)

	if err != nil {
		return nil, err
	}

	result := make(map[string]*domain.UpgradeTarget)
	for _, u := range upgrades {
		target := &domain.UpgradeTarget{
			ID:          u.ID,
			TenantID:    u.TenantID,
			ProjectID:   u.ProjectID,
			PackageID:   u.PackageID,
			ReleaseID:   u.ReleaseID,
			Name:        u.Name,
			Description: u.Description,
			IsActive:    u.IsActive,
			CreatedBy:   u.CreatedBy,
			CreatedAt:   u.CreatedAt,
			UpdatedAt:   u.UpdatedAt,
		}

		// 填充关联信息
		if u.Edges.Project != nil {
			target.ProjectName = u.Edges.Project.Name
		}
		if u.Edges.Package != nil {
			target.PackageName = u.Edges.Package.Name
			target.PackageType = u.Edges.Package.Type.String()
		}
		if u.Edges.Release != nil {
			target.Version = u.Edges.Release.VersionCode
			target.FileName = u.Edges.Release.FileName
			target.FileSize = u.Edges.Release.FileSize
			target.FileHash = u.Edges.Release.FileHash
			target.DownloadURL = fmt.Sprintf("/api/files/download/%s", u.Edges.Release.ID)
		}

		result[u.PackageID] = target
	}

	return result, nil
}
