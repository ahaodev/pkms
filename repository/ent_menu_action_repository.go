package repository

import (
	"context"
	"pkms/domain"
	"pkms/ent"
	"pkms/ent/menu"
	"pkms/ent/menuaction"
)

type entMenuActionRepository struct {
	client *ent.Client
}

func NewMenuActionRepository(client *ent.Client) domain.MenuActionRepository {
	return &entMenuActionRepository{
		client: client,
	}
}

// Create 创建菜单动作
func (r *entMenuActionRepository) Create(ctx context.Context, action *domain.MenuAction) error {
	builder := r.client.MenuAction.Create().
		SetMenuID(action.MenuID).
		SetName(action.Name).
		SetCode(action.Code).
		SetResource(action.Resource).
		SetPermissionKey(action.PermissionKey).
		SetIsSystem(action.IsSystem)

	if action.Method != "" {
		builder.SetMethod(action.Method)
	}
	if action.Description != "" {
		builder.SetDescription(action.Description)
	}

	created, err := builder.Save(ctx)
	if err != nil {
		return err
	}

	// 更新返回的实体
	action.ID = created.ID
	action.CreatedAt = created.CreatedAt
	action.UpdatedAt = created.UpdatedAt
	return nil
}

// GetByID 根据ID获取菜单动作
func (r *entMenuActionRepository) GetByID(ctx context.Context, id string) (*domain.MenuAction, error) {
	action, err := r.client.MenuAction.
		Query().
		Where(menuaction.ID(id)).
		WithMenu().
		First(ctx)
	if err != nil {
		return nil, err
	}

	return r.entToDomain(action), nil
}

// Update 更新菜单动作
func (r *entMenuActionRepository) Update(ctx context.Context, action *domain.MenuAction) error {
	builder := r.client.MenuAction.UpdateOneID(action.ID).
		SetName(action.Name).
		SetCode(action.Code).
		SetResource(action.Resource).
		SetPermissionKey(action.PermissionKey)

	if action.Method != "" {
		builder.SetMethod(action.Method)
	} else {
		builder.ClearMethod()
	}

	if action.Description != "" {
		builder.SetDescription(action.Description)
	} else {
		builder.ClearDescription()
	}

	updated, err := builder.Save(ctx)
	if err != nil {
		return err
	}

	action.UpdatedAt = updated.UpdatedAt
	return nil
}

// Delete 删除菜单动作
func (r *entMenuActionRepository) Delete(ctx context.Context, id string) error {
	return r.client.MenuAction.DeleteOneID(id).Exec(ctx)
}

// GetByMenuID 根据菜单ID获取所有动作
func (r *entMenuActionRepository) GetByMenuID(ctx context.Context, menuID string) ([]*domain.MenuAction, error) {
	actions, err := r.client.MenuAction.
		Query().
		Where(menuaction.HasMenuWith(menu.ID(menuID))).
		WithMenu().
		All(ctx)
	if err != nil {
		return nil, err
	}

	return r.entsToDomains(actions), nil
}

// GetByPermissionKey 根据权限键获取菜单动作
func (r *entMenuActionRepository) GetByPermissionKey(ctx context.Context, permissionKey string) (*domain.MenuAction, error) {
	action, err := r.client.MenuAction.
		Query().
		Where(menuaction.PermissionKey(permissionKey)).
		WithMenu().
		First(ctx)
	if err != nil {
		return nil, err
	}

	return r.entToDomain(action), nil
}

// GetByResource 根据资源路径和方法获取菜单动作
func (r *entMenuActionRepository) GetByResource(ctx context.Context, resource string, method string) ([]*domain.MenuAction, error) {
	query := r.client.MenuAction.
		Query().
		Where(menuaction.Resource(resource)).
		WithMenu()

	if method != "" {
		query = query.Where(menuaction.Method(method))
	}

	actions, err := query.All(ctx)
	if err != nil {
		return nil, err
	}

	return r.entsToDomains(actions), nil
}

// CreateBatch 批量创建菜单动作
func (r *entMenuActionRepository) CreateBatch(ctx context.Context, actions []*domain.MenuAction) error {
	builders := make([]*ent.MenuActionCreate, len(actions))

	for i, action := range actions {
		builder := r.client.MenuAction.Create().
			SetMenuID(action.MenuID).
			SetName(action.Name).
			SetCode(action.Code).
			SetResource(action.Resource).
			SetPermissionKey(action.PermissionKey).
			SetIsSystem(action.IsSystem)

		if action.Method != "" {
			builder.SetMethod(action.Method)
		}
		if action.Description != "" {
			builder.SetDescription(action.Description)
		}

		builders[i] = builder
	}

	created, err := r.client.MenuAction.CreateBulk(builders...).Save(ctx)
	if err != nil {
		return err
	}

	// 更新返回的实体
	for i, action := range actions {
		if i < len(created) {
			action.ID = created[i].ID
			action.CreatedAt = created[i].CreatedAt
			action.UpdatedAt = created[i].UpdatedAt
		}
	}

	return nil
}

// DeleteByMenuID 根据菜单ID删除所有动作
func (r *entMenuActionRepository) DeleteByMenuID(ctx context.Context, menuID string) error {
	_, err := r.client.MenuAction.
		Delete().
		Where(menuaction.HasMenuWith(menu.ID(menuID))).
		Exec(ctx)
	return err
}

// entToDomain 将Ent实体转换为Domain实体
func (r *entMenuActionRepository) entToDomain(action *ent.MenuAction) *domain.MenuAction {
	domainAction := &domain.MenuAction{
		ID:            action.ID,
		Name:          action.Name,
		Code:          action.Code,
		Resource:      action.Resource,
		Method:        action.Method,
		PermissionKey: action.PermissionKey,
		Description:   action.Description,
		IsSystem:      action.IsSystem,
		CreatedAt:     action.CreatedAt,
		UpdatedAt:     action.UpdatedAt,
	}

	// 从菜单边获取MenuID
	if action.Edges.Menu != nil {
		domainAction.MenuID = action.Edges.Menu.ID
	}

	return domainAction
}

// entsToDomains 批量转换实体
func (r *entMenuActionRepository) entsToDomains(actions []*ent.MenuAction) []*domain.MenuAction {
	var result []*domain.MenuAction
	for _, action := range actions {
		result = append(result, r.entToDomain(action))
	}
	return result
}
