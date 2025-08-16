package repository

import (
	"context"
	"pkms/domain"
	"pkms/ent"
	"pkms/ent/menu"
	"pkms/ent/role"
)

type entMenuRepository struct {
	client *ent.Client
}

func NewMenuRepository(client *ent.Client) domain.MenuRepository {
	return &entMenuRepository{
		client: client,
	}
}

// Create 创建菜单
func (r *entMenuRepository) Create(ctx context.Context, m *domain.Menu) error {
	builder := r.client.Menu.Create().
		SetName(m.Name).
		SetSort(m.Sort).
		SetVisible(m.Visible).
		SetIsSystem(m.IsSystem)

	if m.Path != "" {
		builder.SetPath(m.Path)
	}
	if m.Icon != "" {
		builder.SetIcon(m.Icon)
	}
	if m.Component != "" {
		builder.SetComponent(m.Component)
	}
	if m.TenantID != "" {
		builder.SetTenantID(m.TenantID)
	}
	if m.Description != "" {
		builder.SetDescription(m.Description)
	}
	if m.ParentID != nil {
		builder.SetParentID(*m.ParentID)
	}

	created, err := builder.Save(ctx)
	if err != nil {
		return err
	}

	// 更新返回的实体
	m.ID = created.ID
	m.CreatedAt = created.CreatedAt
	m.UpdatedAt = created.UpdatedAt
	return nil
}

// GetByID 根据ID获取菜单
func (r *entMenuRepository) GetByID(ctx context.Context, id string) (*domain.Menu, error) {
	m, err := r.client.Menu.
		Query().
		Where(menu.ID(id)).
		WithActions().
		WithChildren().
		First(ctx)
	if err != nil {
		return nil, err
	}

	return r.entToDomain(m), nil
}

// Update 更新菜单
func (r *entMenuRepository) Update(ctx context.Context, m *domain.Menu) error {
	builder := r.client.Menu.UpdateOneID(m.ID).
		SetName(m.Name).
		SetSort(m.Sort).
		SetVisible(m.Visible)

	if m.Path != "" {
		builder.SetPath(m.Path)
	} else {
		builder.ClearPath()
	}

	if m.Icon != "" {
		builder.SetIcon(m.Icon)
	} else {
		builder.ClearIcon()
	}

	if m.Component != "" {
		builder.SetComponent(m.Component)
	} else {
		builder.ClearComponent()
	}

	if m.Description != "" {
		builder.SetDescription(m.Description)
	} else {
		builder.ClearDescription()
	}

	if m.ParentID != nil {
		builder.SetParentID(*m.ParentID)
	} else {
		builder.ClearParent()
	}

	updated, err := builder.Save(ctx)
	if err != nil {
		return err
	}

	m.UpdatedAt = updated.UpdatedAt
	return nil
}

// Delete 删除菜单
func (r *entMenuRepository) Delete(ctx context.Context, id string) error {
	return r.client.Menu.DeleteOneID(id).Exec(ctx)
}

// GetByTenant 获取租户的所有菜单
func (r *entMenuRepository) GetByTenant(ctx context.Context, tenantID string) ([]*domain.Menu, error) {
	var menus []*ent.Menu
	var err error

	if tenantID == "" {
		// 获取系统全局菜单
		menus, err = r.client.Menu.
			Query().
			Where(menu.TenantID("")).
			WithActions().
			WithParent().
			Order(ent.Asc(menu.FieldSort)).
			All(ctx)
	} else {
		// 获取租户菜单和系统菜单
		menus, err = r.client.Menu.
			Query().
			Where(menu.Or(
				menu.TenantID(tenantID),
				menu.TenantID(""),
			)).
			WithActions().
			WithParent().
			Order(ent.Asc(menu.FieldSort)).
			All(ctx)
	}

	if err != nil {
		return nil, err
	}

	return r.entsToDomains(menus), nil
}

// GetRootMenus 获取根级菜单
func (r *entMenuRepository) GetRootMenus(ctx context.Context, tenantID string) ([]*domain.Menu, error) {
	var menus []*ent.Menu
	var err error

	query := r.client.Menu.
		Query().
		Where(menu.Not(menu.HasParent())).
		WithActions().
		WithChildren().
		Order(ent.Asc(menu.FieldSort))

	if tenantID == "" {
		menus, err = query.Where(menu.TenantID("")).All(ctx)
	} else {
		menus, err = query.Where(menu.Or(
			menu.TenantID(tenantID),
			menu.TenantID(""),
		)).All(ctx)
	}

	if err != nil {
		return nil, err
	}

	return r.entsToDomains(menus), nil
}

// GetChildrenByParentID 获取指定父菜单的子菜单
func (r *entMenuRepository) GetChildrenByParentID(ctx context.Context, parentID string) ([]*domain.Menu, error) {
	menus, err := r.client.Menu.
		Query().
		Where(menu.HasParentWith(menu.ID(parentID))).
		WithActions().
		WithChildren().
		Order(ent.Asc(menu.FieldSort)).
		All(ctx)
	if err != nil {
		return nil, err
	}

	return r.entsToDomains(menus), nil
}

// GetMenuTree 获取菜单树结构
func (r *entMenuRepository) GetMenuTree(ctx context.Context, tenantID string) ([]*domain.MenuTreeNode, error) {
	rootMenus, err := r.GetRootMenus(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	var result []*domain.MenuTreeNode
	for _, rootMenu := range rootMenus {
		node, err := r.buildMenuTree(ctx, rootMenu)
		if err != nil {
			return nil, err
		}
		result = append(result, node)
	}

	return result, nil
}

// GetByPath 根据路径获取菜单
func (r *entMenuRepository) GetByPath(ctx context.Context, path string, tenantID string) (*domain.Menu, error) {
	query := r.client.Menu.
		Query().
		Where(menu.Path(path)).
		WithActions().
		WithParent()

	if tenantID == "" {
		query = query.Where(menu.TenantID(""))
	} else {
		query = query.Where(menu.Or(
			menu.TenantID(tenantID),
			menu.TenantID(""),
		))
	}

	m, err := query.First(ctx)
	if err != nil {
		return nil, err
	}

	return r.entToDomain(m), nil
}

// GetMenusByRole 获取角色关联的菜单
func (r *entMenuRepository) GetMenusByRole(ctx context.Context, roleID string, tenantID string) ([]*domain.Menu, error) {
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

	return r.entsToDomains(menus), nil
}

// GetVisibleMenus 获取可见菜单
func (r *entMenuRepository) GetVisibleMenus(ctx context.Context, tenantID string) ([]*domain.Menu, error) {
	var menus []*ent.Menu
	var err error

	query := r.client.Menu.
		Query().
		Where(menu.Visible(true)).
		WithActions().
		WithParent().
		Order(ent.Asc(menu.FieldSort))

	if tenantID == "" {
		menus, err = query.Where(menu.TenantID("")).All(ctx)
	} else {
		menus, err = query.Where(menu.Or(
			menu.TenantID(tenantID),
			menu.TenantID(""),
		)).All(ctx)
	}

	if err != nil {
		return nil, err
	}

	return r.entsToDomains(menus), nil
}

// buildMenuTree 递归构建菜单树
func (r *entMenuRepository) buildMenuTree(ctx context.Context, m *domain.Menu) (*domain.MenuTreeNode, error) {
	node := &domain.MenuTreeNode{
		Menu: m,
	}

	// 获取子菜单
	children, err := r.GetChildrenByParentID(ctx, m.ID)
	if err != nil {
		return nil, err
	}

	// 递归构建子节点
	for _, child := range children {
		childNode, err := r.buildMenuTree(ctx, child)
		if err != nil {
			return nil, err
		}
		node.Children = append(node.Children, childNode)
	}

	return node, nil
}

// entToDomain 将Ent实体转换为Domain实体
func (r *entMenuRepository) entToDomain(m *ent.Menu) *domain.Menu {
	domainMenu := &domain.Menu{
		ID:          m.ID,
		Name:        m.Name,
		Path:        m.Path,
		Icon:        m.Icon,
		Component:   m.Component,
		Sort:        m.Sort,
		Visible:     m.Visible,
		IsSystem:    m.IsSystem,
		TenantID:    m.TenantID,
		Description: m.Description,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}

	// 处理父菜单ID（通过边关系获取）
	if m.Edges.Parent != nil {
		domainMenu.ParentID = &m.Edges.Parent.ID
	}

	// 转换动作
	if m.Edges.Actions != nil {
		for _, action := range m.Edges.Actions {
			domainAction := &domain.MenuAction{
				ID:            action.ID,
				MenuID:        m.ID, // 从当前菜单获取MenuID
				Name:          action.Name,
				Code:          action.Code,
				Resource:      action.Resource,
				Method:        action.Method, // 直接赋值，不需要解引用
				PermissionKey: action.PermissionKey,
				Description:   action.Description, // 直接赋值，不需要解引用
				IsSystem:      action.IsSystem,
				CreatedAt:     action.CreatedAt,
				UpdatedAt:     action.UpdatedAt,
			}
			domainMenu.Actions = append(domainMenu.Actions, domainAction)
		}
	}

	// 转换子菜单
	if m.Edges.Children != nil {
		for _, child := range m.Edges.Children {
			domainMenu.Children = append(domainMenu.Children, r.entToDomain(child))
		}
	}

	return domainMenu
}

// entsToDomains 批量转换实体
func (r *entMenuRepository) entsToDomains(menus []*ent.Menu) []*domain.Menu {
	var result []*domain.Menu
	for _, m := range menus {
		result = append(result, r.entToDomain(m))
	}
	return result
}
