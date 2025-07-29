package repository

import (
	"context"
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

func (tr *entTenantRepository) Fetch(c context.Context) ([]domain.Tenant, error) {
	tenants, err := tr.client.Tenant.
		Query().
		Select(tenant.FieldID, tenant.FieldName, tenant.FieldCreatedAt, tenant.FieldUpdatedAt).
		All(c)

	if err != nil {
		return nil, err
	}

	var result []domain.Tenant
	for _, t := range tenants {
		result = append(result, domain.Tenant{
			ID:        t.ID,
			Name:      t.Name,
			CreatedAt: t.CreatedAt,
			UpdatedAt: t.UpdatedAt,
		})
	}

	return result, nil
}

func (tr *entTenantRepository) GetByID(c context.Context, id string) (domain.Tenant, error) {
	t, err := tr.client.Tenant.
		Query().
		Where(tenant.ID(id)).
		First(c)

	if err != nil {
		return domain.Tenant{}, err
	}

	return domain.Tenant{
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

func (tr *entTenantRepository) GetTenantsByUserID(c context.Context, userID string) ([]domain.Tenant, error) {
	userEntity, err := tr.client.User.
		Query().
		Where(user.ID(userID)).
		WithTenants().
		First(c)

	if err != nil {
		return nil, err
	}

	var result []domain.Tenant
	for _, t := range userEntity.Edges.Tenants {
		result = append(result, domain.Tenant{
			ID:        t.ID,
			Name:      t.Name,
			CreatedAt: t.CreatedAt,
			UpdatedAt: t.UpdatedAt,
		})
	}

	return result, nil
}

func (tr *entTenantRepository) GetTenantUsers(c context.Context, tenantID string) ([]domain.User, error) {
	tenantEntity, err := tr.client.Tenant.
		Query().
		Where(tenant.ID(tenantID)).
		WithUsers().
		First(c)

	if err != nil {
		return nil, err
	}

	var result []domain.User
	for _, u := range tenantEntity.Edges.Users {
		// Get user tenants
		userTenants, _ := tr.GetTenantsByUserID(c, u.ID)
		var tenants []*domain.Tenant
		for i := range userTenants {
			tenants = append(tenants, &userTenants[i])
		}

		result = append(result, domain.User{
			ID:        u.ID,
			Name:      u.Username,
			Tenants:   tenants,
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
func (tr *entTenantRepository) GetTenantUsersWithRole(c context.Context, tenantID string) ([]domain.TenantUser, error) {
	// 首先获取租户下的所有用户
	tenantEntity, err := tr.client.Tenant.
		Query().
		Where(tenant.ID(tenantID)).
		WithUsers().
		First(c)

	if err != nil {
		return nil, err
	}

	var result []domain.TenantUser
	for _, u := range tenantEntity.Edges.Users {
		result = append(result, domain.TenantUser{
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
	// 角色更新通过 Casbin 处理
	return nil
}

func (tr *entTenantRepository) GetTenantUserRole(c context.Context, userID, tenantID string) (domain.TenantUser, error) {
	// 角色获取通过 Casbin 处理
	return domain.TenantUser{}, nil
}

func (tr *entTenantRepository) GetUserTenants(c context.Context, userID string) ([]domain.TenantUser, error) {
	// 这个方法现在通过 Casbin 在控制器层实现
	return []domain.TenantUser{}, nil
}
