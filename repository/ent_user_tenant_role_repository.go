package repository

import (
	"context"
	"pkms/domain"
	"pkms/ent"
	"pkms/ent/role"
	"pkms/ent/tenant"
	"pkms/ent/user"
	"pkms/ent/usertenantrole"
)

type entUserTenantRoleRepository struct {
	client *ent.Client
}

func NewEntUserTenantRoleRepository(client *ent.Client) domain.UserTenantRoleRepository {
	return &entUserTenantRoleRepository{
		client: client,
	}
}

func (repo *entUserTenantRoleRepository) Create(ctx context.Context, userTenantRole *domain.UserTenantRole) error {
	_, err := repo.client.UserTenantRole.
		Create().
		SetUserID(userTenantRole.UserID).
		SetTenantID(userTenantRole.TenantID).
		SetRoleID(userTenantRole.RoleID).
		Save(ctx)

	return err
}

func (repo *entUserTenantRoleRepository) GetByID(ctx context.Context, id string) (*domain.UserTenantRole, error) {
	ent, err := repo.client.UserTenantRole.
		Query().
		Where(usertenantrole.ID(id)).
		WithUser().
		WithTenant().
		WithRole().
		Only(ctx)

	if err != nil {
		return nil, err
	}

	return repo.toDomain(ent), nil
}

func (repo *entUserTenantRoleRepository) Delete(ctx context.Context, id string) error {
	return repo.client.UserTenantRole.
		DeleteOneID(id).
		Exec(ctx)
}

func (repo *entUserTenantRoleRepository) GetByUserTenantRole(ctx context.Context, userID, tenantID, roleID string) (*domain.UserTenantRole, error) {
	ent, err := repo.client.UserTenantRole.
		Query().
		Where(
			usertenantrole.UserID(userID),
			usertenantrole.TenantID(tenantID),
			usertenantrole.RoleID(roleID),
		).
		WithUser().
		WithTenant().
		WithRole().
		Only(ctx)

	if err != nil {
		return nil, err
	}

	return repo.toDomain(ent), nil
}

func (repo *entUserTenantRoleRepository) GetRolesByUserTenant(ctx context.Context, userID, tenantID string) ([]*domain.Role, error) {
	roles, err := repo.client.Role.
		Query().
		Where(role.HasUserTenantRolesWith(
			usertenantrole.UserID(userID),
			usertenantrole.TenantID(tenantID),
		)).
		All(ctx)

	if err != nil {
		return nil, err
	}

	var result []*domain.Role
	for _, r := range roles {
		result = append(result, &domain.Role{
			ID:          r.ID,
			Name:        r.Name,
			Code:        r.Code,
			Description: r.Description,
			TenantID:    r.TenantID,
			IsSystem:    r.IsSystem,
			IsActive:    r.IsActive,
			CreatedAt:   r.CreatedAt,
			UpdatedAt:   r.UpdatedAt,
		})
	}

	return result, nil
}

func (repo *entUserTenantRoleRepository) GetUsersByTenantRole(ctx context.Context, tenantID, roleID string) ([]*domain.User, error) {
	users, err := repo.client.User.
		Query().
		Where(user.HasUserTenantRolesWith(
			usertenantrole.TenantID(tenantID),
			usertenantrole.RoleID(roleID),
		)).
		All(ctx)

	if err != nil {
		return nil, err
	}

	var result []*domain.User
	for _, u := range users {
		result = append(result, &domain.User{
			ID:        u.ID,
			Name:      u.Username,
			Password:  "", // 不返回密码
			IsActive:  u.IsActive,
			CreatedAt: u.CreatedAt,
			UpdatedAt: u.UpdatedAt,
		})
	}

	return result, nil
}

func (repo *entUserTenantRoleRepository) GetTenantsByUserRole(ctx context.Context, userID, roleID string) ([]*domain.Tenant, error) {
	tenants, err := repo.client.Tenant.
		Query().
		Where(tenant.HasUserTenantRolesWith(
			usertenantrole.UserID(userID),
			usertenantrole.RoleID(roleID),
		)).
		All(ctx)

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

func (repo *entUserTenantRoleRepository) GetAllUserTenantRoles(ctx context.Context, userID string) ([]*domain.UserTenantRole, error) {
	ents, err := repo.client.UserTenantRole.
		Query().
		Where(usertenantrole.UserID(userID)).
		WithUser().
		WithTenant().
		WithRole().
		All(ctx)

	if err != nil {
		return nil, err
	}

	var result []*domain.UserTenantRole
	for _, ent := range ents {
		result = append(result, repo.toDomain(ent))
	}

	return result, nil
}

func (repo *entUserTenantRoleRepository) AssignRolesToUserInTenant(ctx context.Context, userID, tenantID string, roleIDs []string) error {
	tx, err := repo.client.Tx(ctx)
	if err != nil {
		return err
	}

	defer func() {
		if err != nil {
			tx.Rollback()
		} else {
			tx.Commit()
		}
	}()

	for _, roleID := range roleIDs {
		// 检查是否已存在
		exists, err := tx.UserTenantRole.
			Query().
			Where(
				usertenantrole.UserID(userID),
				usertenantrole.TenantID(tenantID),
				usertenantrole.RoleID(roleID),
			).
			Exist(ctx)

		if err != nil {
			return err
		}

		if !exists {
			_, err = tx.UserTenantRole.
				Create().
				SetUserID(userID).
				SetTenantID(tenantID).
				SetRoleID(roleID).
				Save(ctx)

			if err != nil {
				return err
			}
		}
	}

	return nil
}

func (repo *entUserTenantRoleRepository) RemoveRolesFromUserInTenant(ctx context.Context, userID, tenantID string, roleIDs []string) error {
	_, err := repo.client.UserTenantRole.
		Delete().
		Where(
			usertenantrole.UserID(userID),
			usertenantrole.TenantID(tenantID),
			usertenantrole.RoleIDIn(roleIDs...),
		).
		Exec(ctx)

	return err
}

func (repo *entUserTenantRoleRepository) RemoveAllRolesFromUser(ctx context.Context, userID string) error {
	_, err := repo.client.UserTenantRole.
		Delete().
		Where(usertenantrole.UserID(userID)).
		Exec(ctx)

	return err
}

func (repo *entUserTenantRoleRepository) RemoveAllRolesFromUserInTenant(ctx context.Context, userID, tenantID string) error {
	_, err := repo.client.UserTenantRole.
		Delete().
		Where(
			usertenantrole.UserID(userID),
			usertenantrole.TenantID(tenantID),
		).
		Exec(ctx)

	return err
}

func (repo *entUserTenantRoleRepository) toDomain(ent *ent.UserTenantRole) *domain.UserTenantRole {
	result := &domain.UserTenantRole{
		ID:        ent.ID,
		UserID:    ent.UserID,
		TenantID:  ent.TenantID,
		RoleID:    ent.RoleID,
		CreatedAt: ent.CreatedAt,
		UpdatedAt: ent.UpdatedAt,
	}

	if ent.Edges.User != nil {
		result.UserName = ent.Edges.User.Username
	}

	if ent.Edges.Tenant != nil {
		result.TenantName = ent.Edges.Tenant.Name
	}

	if ent.Edges.Role != nil {
		result.RoleName = ent.Edges.Role.Name
		result.RoleCode = ent.Edges.Role.Code
	}

	return result
}
