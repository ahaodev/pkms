package repository

import (
	"context"
	"pkms/domain"
	"pkms/ent"
	"pkms/ent/usertenantrole"
)

type entUserTenantRoleRepository struct {
	client *ent.Client
}

func NewUserTenantRoleRepository(client *ent.Client) domain.UserTenantRoleRepository {
	return &entUserTenantRoleRepository{
		client: client,
	}
}

// Create 创建用户租户角色关联
func (repo *entUserTenantRoleRepository) Create(ctx context.Context, userTenantRole *domain.UserTenantRole) error {
	created, err := repo.client.UserTenantRole.Create().
		SetUserID(userTenantRole.UserID).
		SetTenantID(userTenantRole.TenantID).
		SetRoleCode(userTenantRole.RoleCode).
		Save(ctx)
	if err != nil {
		return err
	}

	userTenantRole.ID = created.ID
	userTenantRole.CreatedAt = created.CreatedAt
	userTenantRole.UpdatedAt = created.UpdatedAt
	return nil
}

// GetByID 根据ID获取用户租户角色关联
func (repo *entUserTenantRoleRepository) GetByID(ctx context.Context, id string) (*domain.UserTenantRole, error) {
	utr, err := repo.client.UserTenantRole.Query().
		Where(usertenantrole.ID(id)).
		WithUser().
		WithTenant().
		First(ctx)
	if err != nil {
		return nil, err
	}

	return repo.entToDomain(utr), nil
}

// Delete 删除用户租户角色关联
func (repo *entUserTenantRoleRepository) Delete(ctx context.Context, id string) error {
	return repo.client.UserTenantRole.DeleteOneID(id).Exec(ctx)
}

// GetByUserTenantRole 根据用户、租户、角色获取关联
func (repo *entUserTenantRoleRepository) GetByUserTenantRole(ctx context.Context, userID, tenantID, roleCode string) (*domain.UserTenantRole, error) {
	utr, err := repo.client.UserTenantRole.Query().
		Where(
			usertenantrole.UserID(userID),
			usertenantrole.TenantID(tenantID),
			usertenantrole.RoleCode(roleCode),
		).
		WithUser().
		WithTenant().
		First(ctx)
	if err != nil {
		return nil, err
	}

	return repo.entToDomain(utr), nil
}

// GetRoleCodesByUserTenant 获取用户在租户下的角色代码
func (repo *entUserTenantRoleRepository) GetRoleCodesByUserTenant(ctx context.Context, userID, tenantID string) ([]string, error) {
	utrs, err := repo.client.UserTenantRole.Query().
		Where(
			usertenantrole.UserID(userID),
			usertenantrole.TenantID(tenantID),
		).
		All(ctx)
	if err != nil {
		return nil, err
	}

	var roleCodes []string
	for _, utr := range utrs {
		roleCodes = append(roleCodes, utr.RoleCode)
	}
	return roleCodes, nil
}

// GetUsersByTenantRole 获取租户下拥有指定角色的用户
func (repo *entUserTenantRoleRepository) GetUsersByTenantRole(ctx context.Context, tenantID, roleCode string) ([]*domain.User, error) {
	utrs, err := repo.client.UserTenantRole.Query().
		Where(
			usertenantrole.TenantID(tenantID),
			usertenantrole.RoleCode(roleCode),
		).
		WithUser().
		All(ctx)
	if err != nil {
		return nil, err
	}

	var users []*domain.User
	for _, utr := range utrs {
		if utr.Edges.User != nil {
			user := &domain.User{
				ID:       utr.Edges.User.ID,
				Name:     utr.Edges.User.Username,
				IsActive: utr.Edges.User.IsActive,
			}
			users = append(users, user)
		}
	}
	return users, nil
}

// GetTenantsByUserRole 获取用户拥有指定角色的租户
func (repo *entUserTenantRoleRepository) GetTenantsByUserRole(ctx context.Context, userID, roleCode string) ([]*domain.Tenant, error) {
	utrs, err := repo.client.UserTenantRole.Query().
		Where(
			usertenantrole.UserID(userID),
			usertenantrole.RoleCode(roleCode),
		).
		WithTenant().
		All(ctx)
	if err != nil {
		return nil, err
	}

	var tenants []*domain.Tenant
	for _, utr := range utrs {
		if utr.Edges.Tenant != nil {
			tenant := &domain.Tenant{
				ID:        utr.Edges.Tenant.ID,
				Name:      utr.Edges.Tenant.Name,
				CreatedAt: utr.Edges.Tenant.CreatedAt,
				UpdatedAt: utr.Edges.Tenant.UpdatedAt,
			}
			tenants = append(tenants, tenant)
		}
	}
	return tenants, nil
}

// GetAllUserTenantRoles 获取用户的所有租户角色关联
func (repo *entUserTenantRoleRepository) GetAllUserTenantRoles(ctx context.Context, userID string) ([]*domain.UserTenantRole, error) {
	utrs, err := repo.client.UserTenantRole.Query().
		Where(usertenantrole.UserID(userID)).
		WithUser().
		WithTenant().
		All(ctx)
	if err != nil {
		return nil, err
	}

	var result []*domain.UserTenantRole
	for _, utr := range utrs {
		result = append(result, repo.entToDomain(utr))
	}
	return result, nil
}

// AssignRolesToUserInTenant 为用户在租户下分配角色
func (repo *entUserTenantRoleRepository) AssignRolesToUserInTenant(ctx context.Context, userID, tenantID string, roleCodes []string) error {
	for _, roleCode := range roleCodes {
		// 检查是否已存在
		exists, err := repo.client.UserTenantRole.Query().
			Where(
				usertenantrole.UserID(userID),
				usertenantrole.TenantID(tenantID),
				usertenantrole.RoleCode(roleCode),
			).
			Exist(ctx)
		if err != nil {
			return err
		}
		if !exists {
			_, err = repo.client.UserTenantRole.Create().
				SetUserID(userID).
				SetTenantID(tenantID).
				SetRoleCode(roleCode).
				Save(ctx)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

// RemoveRolesFromUserInTenant 移除用户在租户下的角色
func (repo *entUserTenantRoleRepository) RemoveRolesFromUserInTenant(ctx context.Context, userID, tenantID string, roleCodes []string) error {
	for _, roleCode := range roleCodes {
		_, err := repo.client.UserTenantRole.Delete().
			Where(
				usertenantrole.UserID(userID),
				usertenantrole.TenantID(tenantID),
				usertenantrole.RoleCode(roleCode),
			).
			Exec(ctx)
		if err != nil {
			return err
		}
	}
	return nil
}

// RemoveAllRolesFromUser 移除用户的所有角色
func (repo *entUserTenantRoleRepository) RemoveAllRolesFromUser(ctx context.Context, userID string) error {
	_, err := repo.client.UserTenantRole.Delete().
		Where(usertenantrole.UserID(userID)).
		Exec(ctx)
	return err
}

// RemoveAllRolesFromUserInTenant 移除用户在指定租户下的所有角色
func (repo *entUserTenantRoleRepository) RemoveAllRolesFromUserInTenant(ctx context.Context, userID, tenantID string) error {
	_, err := repo.client.UserTenantRole.Delete().
		Where(
			usertenantrole.UserID(userID),
			usertenantrole.TenantID(tenantID),
		).
		Exec(ctx)
	return err
}

// entToDomain 将Ent实体转换为Domain实体
func (repo *entUserTenantRoleRepository) entToDomain(utr *ent.UserTenantRole) *domain.UserTenantRole {
	result := &domain.UserTenantRole{
		ID:        utr.ID,
		UserID:    utr.UserID,
		TenantID:  utr.TenantID,
		RoleCode:  utr.RoleCode,
		CreatedAt: utr.CreatedAt,
		UpdatedAt: utr.UpdatedAt,
	}

	// 设置关联信息
	if utr.Edges.User != nil {
		result.UserName = utr.Edges.User.Username
	}
	if utr.Edges.Tenant != nil {
		result.TenantName = utr.Edges.Tenant.Name
	}

	// 根据角色代码设置角色名称
	switch utr.RoleCode {
	case domain.SystemRoleAdmin:
		result.RoleName = "系统管理员"
	case domain.TenantRoleOwner:
		result.RoleName = "租户管理员"
	case domain.TenantRoleUser:
		result.RoleName = "普通用户"
	case domain.TenantRoleViewer:
		result.RoleName = "只读用户"
	default:
		result.RoleName = utr.RoleCode
	}

	return result
}
