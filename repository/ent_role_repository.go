package repository

import (
	"context"
	"pkms/domain"
	"pkms/ent"
	"pkms/ent/menu"
	"pkms/ent/role"
	"pkms/ent/user"
)

type entRoleRepository struct {
	client *ent.Client
}

func NewRoleRepository(client *ent.Client) domain.RoleRepository {
	return &entRoleRepository{
		client: client,
	}
}

// Create 创建角色
func (r *entRoleRepository) Create(ctx context.Context, role *domain.Role) error {
	builder := r.client.Role.Create().
		SetName(role.Name).
		SetCode(role.Code).
		SetIsSystem(role.IsSystem).
		SetIsActive(role.IsActive)

	if role.Description != "" {
		builder.SetDescription(role.Description)
	}
	if role.TenantID != "" {
		builder.SetTenantID(role.TenantID)
	}

	created, err := builder.Save(ctx)
	if err != nil {
		return err
	}

	// 更新返回的实体
	role.ID = created.ID
	role.CreatedAt = created.CreatedAt
	role.UpdatedAt = created.UpdatedAt
	return nil
}

// GetByID 根据ID获取角色
func (r *entRoleRepository) GetByID(ctx context.Context, id string) (*domain.Role, error) {
	role, err := r.client.Role.
		Query().
		Where(role.ID(id)).
		WithMenus().
		WithUsers().
		First(ctx)
	if err != nil {
		return nil, err
	}

	return r.entToDomain(role), nil
}

// GetByCode 根据角色代码获取角色
func (r *entRoleRepository) GetByCode(ctx context.Context, code string, tenantID string) (*domain.Role, error) {
	query := r.client.Role.
		Query().
		Where(role.Code(code)).
		WithMenus().
		WithUsers()

	if tenantID == "" {
		query = query.Where(role.TenantIDIsNil())
	} else {
		query = query.Where(role.Or(
			role.TenantID(tenantID),
			role.TenantIDIsNil(),
		))
	}

	role, err := query.First(ctx)
	if err != nil {
		return nil, err
	}

	return r.entToDomain(role), nil
}

// Update 更新角色
func (r *entRoleRepository) Update(ctx context.Context, role *domain.Role) error {
	builder := r.client.Role.UpdateOneID(role.ID).
		SetName(role.Name).
		SetIsActive(role.IsActive)

	if role.Description != "" {
		builder.SetDescription(role.Description)
	} else {
		builder.ClearDescription()
	}

	updated, err := builder.Save(ctx)
	if err != nil {
		return err
	}

	role.UpdatedAt = updated.UpdatedAt
	return nil
}

// Delete 删除角色
func (r *entRoleRepository) Delete(ctx context.Context, id string) error {
	return r.client.Role.DeleteOneID(id).Exec(ctx)
}

// GetByTenant 获取租户的所有角色
func (r *entRoleRepository) GetByTenant(ctx context.Context, tenantID string) ([]*domain.Role, error) {
	var roles []*ent.Role
	var err error

	if tenantID == "" {
		// 获取系统全局角色
		roles, err = r.client.Role.
			Query().
			Where(role.TenantIDIsNil()).
			WithMenus().
			WithUsers().
			All(ctx)
	} else {
		// 获取租户角色和系统角色
		roles, err = r.client.Role.
			Query().
			Where(role.Or(
				role.TenantID(tenantID),
				role.TenantIDIsNil(),
			)).
			WithMenus().
			WithUsers().
			All(ctx)
	}

	if err != nil {
		return nil, err
	}

	return r.entsToDomains(roles), nil
}

// GetActiveRoles 获取激活的角色
func (r *entRoleRepository) GetActiveRoles(ctx context.Context, tenantID string) ([]*domain.Role, error) {
	var roles []*ent.Role
	var err error

	query := r.client.Role.
		Query().
		Where(role.IsActive(true)).
		WithMenus().
		WithUsers()

	if tenantID == "" {
		roles, err = query.Where(role.TenantIDIsNil()).All(ctx)
	} else {
		roles, err = query.Where(role.Or(
			role.TenantID(tenantID),
			role.TenantIDIsNil(),
		)).All(ctx)
	}

	if err != nil {
		return nil, err
	}

	return r.entsToDomains(roles), nil
}

// GetSystemRoles 获取系统角色
func (r *entRoleRepository) GetSystemRoles(ctx context.Context) ([]*domain.Role, error) {
	roles, err := r.client.Role.
		Query().
		Where(role.IsSystem(true)).
		WithMenus().
		WithUsers().
		All(ctx)
	if err != nil {
		return nil, err
	}

	return r.entsToDomains(roles), nil
}

// GetRolesByUserID 获取用户的角色
func (r *entRoleRepository) GetRolesByUserID(ctx context.Context, userID string, tenantID string) ([]*domain.Role, error) {
	query := r.client.Role.
		Query().
		Where(role.HasUsersWith(user.ID(userID))).
		WithMenus()

	if tenantID != "" {
		query = query.Where(role.Or(
			role.TenantID(tenantID),
			role.TenantIDIsNil(),
		))
	}

	roles, err := query.All(ctx)
	if err != nil {
		return nil, err
	}

	return r.entsToDomains(roles), nil
}

// GetUsersByRoleID 获取拥有指定角色的用户
func (r *entRoleRepository) GetUsersByRoleID(ctx context.Context, roleID string) ([]*domain.User, error) {
	users, err := r.client.User.
		Query().
		Where(user.HasRolesWith(role.ID(roleID))).
		All(ctx)
	if err != nil {
		return nil, err
	}

	var result []*domain.User
	for _, u := range users {
		domainUser := &domain.User{
			ID:        u.ID,
			Name:      u.Username,
			IsActive:  u.IsActive,
			CreatedAt: u.CreatedAt,
			UpdatedAt: u.UpdatedAt,
		}
		result = append(result, domainUser)
	}

	return result, nil
}

// AssignRoleToUser 为用户分配角色
func (r *entRoleRepository) AssignRoleToUser(ctx context.Context, roleID, userID string) error {
	return r.client.Role.
		UpdateOneID(roleID).
		AddUserIDs(userID).
		Exec(ctx)
}

// RemoveRoleFromUser 移除用户的角色
func (r *entRoleRepository) RemoveRoleFromUser(ctx context.Context, roleID, userID string) error {
	return r.client.Role.
		UpdateOneID(roleID).
		RemoveUserIDs(userID).
		Exec(ctx)
}

// RemoveAllRolesFromUser 移除用户的所有角色
func (r *entRoleRepository) RemoveAllRolesFromUser(ctx context.Context, userID string) error {
	return r.client.User.
		UpdateOneID(userID).
		ClearRoles().
		Exec(ctx)
}

// AssignMenusToRole 为角色分配菜单
func (r *entRoleRepository) AssignMenusToRole(ctx context.Context, roleID string, menuIDs []string) error {
	return r.client.Role.
		UpdateOneID(roleID).
		AddMenuIDs(menuIDs...).
		Exec(ctx)
}

// RemoveMenusFromRole 移除角色的菜单
func (r *entRoleRepository) RemoveMenusFromRole(ctx context.Context, roleID string, menuIDs []string) error {
	return r.client.Role.
		UpdateOneID(roleID).
		RemoveMenuIDs(menuIDs...).
		Exec(ctx)
}

// GetMenusByRole 获取角色关联的菜单
func (r *entRoleRepository) GetMenusByRole(ctx context.Context, roleID string) ([]*domain.Menu, error) {
	menus, err := r.client.Menu.
		Query().
		Where(menu.HasRolesWith(role.ID(roleID))).
		WithActions().
		WithParent().
		Order(ent.Asc(menu.FieldSort)).
		All(ctx)
	if err != nil {
		return nil, err
	}

	// 转换为domain.Menu
	var result []*domain.Menu
	for _, m := range menus {
		domainMenu := &domain.Menu{
			ID:        m.ID,
			Name:      m.Name,
			Sort:      m.Sort,
			Visible:   m.Visible,
			IsSystem:  m.IsSystem,
			CreatedAt: m.CreatedAt,
			UpdatedAt: m.UpdatedAt,
		}

		domainMenu.Path = m.Path
		domainMenu.Icon = m.Icon
		domainMenu.Component = m.Component
		domainMenu.TenantID = m.TenantID
		domainMenu.Description = m.Description
		// 处理父菜单ID（通过边关系获取）
		if m.Edges.Parent != nil {
			domainMenu.ParentID = &m.Edges.Parent.ID
		}

		// 转换动作
		if m.Edges.Actions != nil {
			for _, action := range m.Edges.Actions {
				domainAction := &domain.MenuAction{
					ID:            action.ID,
					MenuID:        m.ID, // 从菜单获取MenuID
					Name:          action.Name,
					Code:          action.Code,
					Resource:      action.Resource,
					Method:        action.Method, // 直接赋值
					PermissionKey: action.PermissionKey,
					Description:   action.Description, // 直接赋值
					IsSystem:      action.IsSystem,
					CreatedAt:     action.CreatedAt,
					UpdatedAt:     action.UpdatedAt,
				}
				domainMenu.Actions = append(domainMenu.Actions, domainAction)
			}
		}

		result = append(result, domainMenu)
	}

	return result, nil
}

// entToDomain 将Ent实体转换为Domain实体
func (r *entRoleRepository) entToDomain(role *ent.Role) *domain.Role {
	domainRole := &domain.Role{
		ID:        role.ID,
		Name:      role.Name,
		Code:      role.Code,
		IsSystem:  role.IsSystem,
		IsActive:  role.IsActive,
		CreatedAt: role.CreatedAt,
		UpdatedAt: role.UpdatedAt,
	}

	domainRole.Description = role.Description
	domainRole.TenantID = role.TenantID

	// 转换关联的用户
	if role.Edges.Users != nil {
		for _, u := range role.Edges.Users {
			domainUser := &domain.User{
				ID:        u.ID,
				Name:      u.Username,
				IsActive:  u.IsActive,
				CreatedAt: u.CreatedAt,
				UpdatedAt: u.UpdatedAt,
			}
			domainRole.Users = append(domainRole.Users, domainUser)
		}
	}

	// 转换关联的菜单
	if role.Edges.Menus != nil {
		for _, m := range role.Edges.Menus {
			domainMenu := &domain.Menu{
				ID:        m.ID,
				Name:      m.Name,
				Sort:      m.Sort,
				Visible:   m.Visible,
				IsSystem:  m.IsSystem,
				CreatedAt: m.CreatedAt,
				UpdatedAt: m.UpdatedAt,
			}

			domainMenu.Path = m.Path
			domainMenu.Icon = m.Icon
			domainMenu.Component = m.Component
			domainMenu.TenantID = m.TenantID
			domainMenu.Description = m.Description

			// 处理父菜单ID（通过边关系获取）
			if m.Edges.Parent != nil {
				domainMenu.ParentID = &m.Edges.Parent.ID
			}

			domainRole.Menus = append(domainRole.Menus, domainMenu)
		}
	}

	return domainRole
}

// entsToDomains 批量转换实体
func (r *entRoleRepository) entsToDomains(roles []*ent.Role) []*domain.Role {
	var result []*domain.Role
	for _, role := range roles {
		result = append(result, r.entToDomain(role))
	}
	return result
}
