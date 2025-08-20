package repository

import (
	"context"
	"errors"
	"pkms/domain"
	"pkms/ent"
	"pkms/ent/tenant"
	"pkms/ent/user"
)

type entTenantRepository struct {
	client *ent.Client
}

func NewTenantRepository(client *ent.Client) domain.TenantRepository {
	return &entTenantRepository{
		client: client,
	}
}

func (tr *entTenantRepository) Create(c context.Context, t *domain.Tenant) error {
	created, err := tr.client.Tenant.
		Create().
		SetName(t.Name).
		Save(c)

	if err != nil {
		return err
	}

	t.ID = created.ID
	t.CreatedAt = created.CreatedAt
	t.UpdatedAt = created.UpdatedAt
	return nil
}

func (tr *entTenantRepository) Fetch(c context.Context) ([]*domain.Tenant, error) {
	// 查询所有租户，排除 admin 租户
	tenants, err := tr.client.Tenant.
		Query().
		Select(tenant.FieldID, tenant.FieldName, tenant.FieldCreatedAt, tenant.FieldUpdatedAt).
		Where(tenant.Not(tenant.Name("admin"))).
		All(c)

	if err != nil {
		return nil, err
	}

	var result []*domain.Tenant
	for _, t := range tenants {
		result = append(result, &domain.Tenant{
			ID:        t.ID,
			Name:      t.Name,
			CreatedAt: t.CreatedAt,
			UpdatedAt: t.UpdatedAt,
		})
	}

	return result, nil
}

func (tr *entTenantRepository) FetchPaged(c context.Context, params domain.QueryParams) (*domain.TenantPagedResult, error) {
	// 构建查询
	query := tr.client.Tenant.
		Query().
		Where(tenant.Not(tenant.Name("admin")))

	// 获取总数
	total, err := query.Clone().Count(c)
	if err != nil {
		return nil, err
	}

	// 应用分页
	tenants, err := query.
		Select(tenant.FieldID, tenant.FieldName, tenant.FieldCreatedAt, tenant.FieldUpdatedAt).
		Offset((params.Page - 1) * params.PageSize).
		Limit(params.PageSize).
		All(c)

	if err != nil {
		return nil, err
	}

	// 转换为域对象
	var result []*domain.Tenant
	for _, t := range tenants {
		result = append(result, &domain.Tenant{
			ID:        t.ID,
			Name:      t.Name,
			CreatedAt: t.CreatedAt,
			UpdatedAt: t.UpdatedAt,
		})
	}

	return domain.NewPagedResult(result, total, params.Page, params.PageSize), nil
}

func (tr *entTenantRepository) GetByID(c context.Context, id string) (*domain.Tenant, error) {
	t, err := tr.client.Tenant.
		Query().
		Where(tenant.ID(id)).
		First(c)

	if err != nil {
		return nil, err
	}

	return &domain.Tenant{
		ID:        t.ID,
		Name:      t.Name,
		CreatedAt: t.CreatedAt,
		UpdatedAt: t.UpdatedAt,
	}, nil
}

func (tr *entTenantRepository) Update(c context.Context, t *domain.Tenant) error {
	updated, err := tr.client.Tenant.
		UpdateOneID(t.ID).
		SetName(t.Name).
		Save(c)

	if err != nil {
		return err
	}

	t.UpdatedAt = updated.UpdatedAt
	return nil
}

func (tr *entTenantRepository) Delete(c context.Context, id string) error {
	return tr.client.Tenant.
		DeleteOneID(id).
		Exec(c)
}

func (tr *entTenantRepository) GetTenantsByUserID(c context.Context, userID string) ([]*domain.Tenant, error) {
	userEntity, err := tr.client.User.
		Query().
		Where(user.ID(userID)).
		WithTenants().
		First(c)

	if err != nil {
		return nil, err
	}

	var result []*domain.Tenant
	for _, t := range userEntity.Edges.Tenants {
		result = append(result, &domain.Tenant{
			ID:        t.ID,
			Name:      t.Name,
			CreatedAt: t.CreatedAt,
			UpdatedAt: t.UpdatedAt,
		})
	}

	return result, nil
}

func (tr *entTenantRepository) GetTenantUsers(c context.Context, tenantID string) ([]*domain.User, error) {
	tenantEntity, err := tr.client.Tenant.
		Query().
		Where(tenant.ID(tenantID)).
		WithUsers().
		First(c)

	if err != nil {
		return nil, err
	}

	var result []*domain.User
	for _, u := range tenantEntity.Edges.Users {
		// Get user tenants
		userTenants, _ := tr.GetTenantsByUserID(c, u.ID)

		result = append(result, &domain.User{
			ID:        u.ID,
			Name:      u.Username,
			Tenants:   userTenants,
			IsActive:  u.IsActive,
			CreatedAt: u.CreatedAt,
			UpdatedAt: u.UpdatedAt,
		})
	}

	return result, nil
}

func (tr *entTenantRepository) AddUserToTenant(c context.Context, userID, tenantID string) error {
	_, err := tr.client.User.
		UpdateOneID(userID).
		AddTenantIDs(tenantID).
		Save(c)

	return err
}

func (tr *entTenantRepository) RemoveUserFromTenant(c context.Context, userID, tenantID string) error {
	_, err := tr.client.User.
		UpdateOneID(userID).
		RemoveTenantIDs(tenantID).
		Save(c)

	return err
}

// GetTenantUsersWithRole 获取租户用户及其角色信息
func (tr *entTenantRepository) GetTenantUsersWithRole(c context.Context, tenantID string) ([]*domain.TenantUser, error) {
	// 首先获取租户下的所有用户
	tenantEntity, err := tr.client.Tenant.
		Query().
		Where(tenant.ID(tenantID)).
		WithUsers().
		First(c)

	if err != nil {
		return nil, err
	}

	var result []*domain.TenantUser
	for _, u := range tenantEntity.Edges.Users {
		result = append(result, &domain.TenantUser{
			TenantID:   tenantID,
			UserID:     u.ID,
			Username:   u.Username,
			IsActive:   u.IsActive,
			CreatedAt:  u.CreatedAt,
			UpdatedAt:  u.UpdatedAt,
			Role:       "user", // 默认角色，实际角色会在控制器层通过 Casbin 获取并覆盖
			TenantName: tenantEntity.Name,
		})
	}

	return result, nil
}

func (tr *entTenantRepository) AddUserToTenantWithRole(c context.Context, userID, tenantID, role, createdBy string) error {
	// 首先添加用户到租户（使用现有的多对多关系）
	err := tr.AddUserToTenant(c, userID, tenantID)
	if err != nil {
		return err
	}
	// 角色分配在 usecase 层通过 Casbin 处理
	return nil
}

func (tr *entTenantRepository) UpdateTenantUserRole(c context.Context, userID, tenantID, role string, isActive *bool) error {
	// 验证用户是否在租户中
	userEntity, err := tr.client.User.
		Query().
		Where(user.ID(userID)).
		WithTenants(func(tq *ent.TenantQuery) {
			tq.Where(tenant.ID(tenantID))
		}).
		First(c)

	if err != nil {
		return err
	}

	// 检查用户是否属于该租户
	found := false
	for _, t := range userEntity.Edges.Tenants {
		if t.ID == tenantID {
			found = true
			break
		}
	}

	if !found {
		return errors.New("user is not a member of this tenant")
	}

	// 更新用户状态（如果提供）
	if isActive != nil {
		_, err = tr.client.User.
			UpdateOneID(userID).
			SetIsActive(*isActive).
			Save(c)
		if err != nil {
			return err
		}
	}

	// 角色更新需要在上层通过 Casbin 处理
	return nil
}

func (tr *entTenantRepository) GetTenantUserRole(c context.Context, userID, tenantID string) (*domain.TenantUser, error) {
	// 获取用户基本信息
	userEntity, err := tr.client.User.
		Query().
		Where(user.ID(userID)).
		First(c)

	if err != nil {
		return nil, err
	}

	// 获取租户信息
	tenantEntity, err := tr.client.Tenant.
		Query().
		Where(tenant.ID(tenantID)).
		First(c)

	if err != nil {
		return nil, err
	}

	// 验证用户是否在租户中
	exists, err := tr.client.User.
		Query().
		Where(user.ID(userID)).
		QueryTenants().
		Where(tenant.ID(tenantID)).
		Exist(c)

	if err != nil || !exists {
		return nil, errors.New("user is not a member of this tenant")
	}

	return &domain.TenantUser{
		TenantID:   tenantID,
		UserID:     userID,
		Username:   userEntity.Username,
		IsActive:   userEntity.IsActive,
		CreatedAt:  userEntity.CreatedAt,
		UpdatedAt:  userEntity.UpdatedAt,
		Role:       "user", // 默认角色，实际角色需要在控制器层通过 Casbin 获取
		TenantName: tenantEntity.Name,
	}, nil
}

func (tr *entTenantRepository) GetUserTenants(c context.Context, userID string) ([]*domain.TenantUser, error) {
	// 获取用户及其所有租户
	userEntity, err := tr.client.User.
		Query().
		Where(user.ID(userID)).
		WithTenants().
		First(c)

	if err != nil {
		return nil, err
	}

	var result []*domain.TenantUser
	for _, t := range userEntity.Edges.Tenants {
		result = append(result, &domain.TenantUser{
			TenantID:   t.ID,
			UserID:     userID,
			Username:   userEntity.Username,
			IsActive:   userEntity.IsActive,
			CreatedAt:  userEntity.CreatedAt,
			UpdatedAt:  userEntity.UpdatedAt,
			Role:       "user", // 默认角色，实际角色需要在控制器层通过 Casbin 获取
			TenantName: t.Name,
		})
	}

	return result, nil
}
