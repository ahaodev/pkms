package usecase

import (
	"context"
	"errors"
	"fmt"
	"pkms/domain"
	"pkms/internal/casbin"
	"time"
)

type menuUsecase struct {
	menuRepository       domain.MenuRepository
	menuActionRepository domain.MenuActionRepository
	roleRepository       domain.RoleRepository
	casbinManager        *casbin.CasbinManager
	contextTimeout       time.Duration
}

func NewMenuUsecase(
	menuRepo domain.MenuRepository,
	menuActionRepo domain.MenuActionRepository,
	roleRepo domain.RoleRepository,
	casbinManager *casbin.CasbinManager,
	timeout time.Duration,
) domain.MenuUsecase {
	return &menuUsecase{
		menuRepository:       menuRepo,
		menuActionRepository: menuActionRepo,
		roleRepository:       roleRepo,
		casbinManager:        casbinManager,
		contextTimeout:       timeout,
	}
}

// CreateMenu 创建菜单
func (uc *menuUsecase) CreateMenu(ctx context.Context, req *domain.CreateMenuRequest) (*domain.Menu, error) {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	// 验证父菜单是否存在
	if req.ParentID != "" {
		_, err := uc.menuRepository.GetByID(ctx, req.ParentID)
		if err != nil {
			return nil, fmt.Errorf("parent menu not found: %w", err)
		}
	}

	// 检查同级菜单名称是否重复
	if req.Path != "" {
		existing, err := uc.menuRepository.GetByPath(ctx, req.Path, req.TenantID)
		if err == nil && existing != nil {
			return nil, errors.New("menu path already exists")
		}
	}

	menu := &domain.Menu{
		Name:        req.Name,
		Path:        req.Path,
		Icon:        req.Icon,
		Component:   req.Component,
		Sort:        req.Sort,
		Visible:     req.Visible,
		TenantID:    req.TenantID,
		Description: req.Description,
		IsSystem:    false, // 用户创建的菜单默认非系统菜单
	}

	if req.ParentID != "" {
		menu.ParentID = &req.ParentID
	}

	err := uc.menuRepository.Create(ctx, menu)
	if err != nil {
		return nil, fmt.Errorf("failed to create menu: %w", err)
	}

	return menu, nil
}

// GetMenuByID 根据ID获取菜单
func (uc *menuUsecase) GetMenuByID(ctx context.Context, id string) (*domain.Menu, error) {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	return uc.menuRepository.GetByID(ctx, id)
}

// UpdateMenu 更新菜单
func (uc *menuUsecase) UpdateMenu(ctx context.Context, id string, req *domain.UpdateMenuRequest) (*domain.Menu, error) {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	// 获取现有菜单
	menu, err := uc.menuRepository.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("menu not found: %w", err)
	}

	// 检查是否为系统菜单
	if menu.IsSystem {
		return nil, errors.New("cannot modify system menu")
	}

	// 验证父菜单
	if req.ParentID != "" && req.ParentID != id {
		_, err := uc.menuRepository.GetByID(ctx, req.ParentID)
		if err != nil {
			return nil, fmt.Errorf("parent menu not found: %w", err)
		}
	}

	// 更新字段
	if req.Name != "" {
		menu.Name = req.Name
	}
	if req.Path != "" {
		menu.Path = req.Path
	}
	if req.Icon != "" {
		menu.Icon = req.Icon
	}
	if req.Component != "" {
		menu.Component = req.Component
	}
	if req.Sort != nil {
		menu.Sort = *req.Sort
	}
	if req.Visible != nil {
		menu.Visible = *req.Visible
	}
	if req.ParentID != "" {
		menu.ParentID = &req.ParentID
	}
	if req.Description != "" {
		menu.Description = req.Description
	}

	err = uc.menuRepository.Update(ctx, menu)
	if err != nil {
		return nil, fmt.Errorf("failed to update menu: %w", err)
	}

	return menu, nil
}

// DeleteMenu 删除菜单
func (uc *menuUsecase) DeleteMenu(ctx context.Context, id string) error {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	// 获取菜单信息
	menu, err := uc.menuRepository.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("menu not found: %w", err)
	}

	// 检查是否为系统菜单
	if menu.IsSystem {
		return errors.New("cannot delete system menu")
	}

	// 检查是否有子菜单
	children, err := uc.menuRepository.GetChildrenByParentID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check children: %w", err)
	}
	if len(children) > 0 {
		return errors.New("cannot delete menu with children")
	}

	// 删除菜单的所有动作
	err = uc.menuActionRepository.DeleteByMenuID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete menu actions: %w", err)
	}

	// 删除菜单
	err = uc.menuRepository.Delete(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete menu: %w", err)
	}

	return nil
}

// GetMenuTree 获取菜单树
func (uc *menuUsecase) GetMenuTree(ctx context.Context, tenantID string) ([]*domain.MenuTreeNode, error) {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	return uc.menuRepository.GetMenuTree(ctx, tenantID)
}

// GetUserMenuTree 获取用户权限范围内的菜单树
func (uc *menuUsecase) GetUserMenuTree(ctx context.Context, userID, tenantID string) ([]*domain.MenuTreeNode, error) {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	// 获取用户角色
	roles, err := uc.roleRepository.GetRolesByUserID(ctx, userID, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user roles: %w", err)
	}

	if len(roles) == 0 {
		return []*domain.MenuTreeNode{}, nil
	}

	// 获取用户可访问的菜单
	menuMap := make(map[string]*domain.Menu)
	for _, role := range roles {
		menus, err := uc.roleRepository.GetMenusByRole(ctx, role.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to get role menus: %w", err)
		}
		for _, menu := range menus {
			if menu.Visible {
				menuMap[menu.ID] = menu
			}
		}
	}

	// 构建菜单树
	tree := uc.buildUserMenuTree(ctx, menuMap)
	return tree, nil
}

// CreateMenuAction 创建菜单动作
func (uc *menuUsecase) CreateMenuAction(ctx context.Context, menuID string, req *domain.CreateMenuActionRequest) (*domain.MenuAction, error) {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	// 验证菜单是否存在
	_, err := uc.menuRepository.GetByID(ctx, menuID)
	if err != nil {
		return nil, fmt.Errorf("menu not found: %w", err)
	}

	// 检查权限键是否重复
	existing, err := uc.menuActionRepository.GetByPermissionKey(ctx, req.PermissionKey)
	if err == nil && existing != nil {
		return nil, errors.New("permission key already exists")
	}

	action := &domain.MenuAction{
		MenuID:        menuID,
		Name:          req.Name,
		Code:          req.Code,
		Resource:      req.Resource,
		Method:        req.Method,
		PermissionKey: req.PermissionKey,
		Description:   req.Description,
		IsSystem:      false,
	}

	err = uc.menuActionRepository.Create(ctx, action)
	if err != nil {
		return nil, fmt.Errorf("failed to create menu action: %w", err)
	}

	return action, nil
}

// GetMenuActions 获取菜单的所有动作
func (uc *menuUsecase) GetMenuActions(ctx context.Context, menuID string) ([]*domain.MenuAction, error) {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	return uc.menuActionRepository.GetByMenuID(ctx, menuID)
}

// UpdateMenuAction 更新菜单动作
func (uc *menuUsecase) UpdateMenuAction(ctx context.Context, actionID string, req *domain.CreateMenuActionRequest) (*domain.MenuAction, error) {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	// 获取现有动作
	action, err := uc.menuActionRepository.GetByID(ctx, actionID)
	if err != nil {
		return nil, fmt.Errorf("menu action not found: %w", err)
	}

	// 检查是否为系统动作
	if action.IsSystem {
		return nil, errors.New("cannot modify system menu action")
	}

	// 检查权限键是否重复（排除自己）
	if req.PermissionKey != action.PermissionKey {
		existing, err := uc.menuActionRepository.GetByPermissionKey(ctx, req.PermissionKey)
		if err == nil && existing != nil && existing.ID != actionID {
			return nil, errors.New("permission key already exists")
		}
	}

	// 更新字段
	action.Name = req.Name
	action.Code = req.Code
	action.Resource = req.Resource
	action.Method = req.Method
	action.PermissionKey = req.PermissionKey
	action.Description = req.Description

	err = uc.menuActionRepository.Update(ctx, action)
	if err != nil {
		return nil, fmt.Errorf("failed to update menu action: %w", err)
	}

	return action, nil
}

// DeleteMenuAction 删除菜单动作
func (uc *menuUsecase) DeleteMenuAction(ctx context.Context, actionID string) error {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	// 获取动作信息
	action, err := uc.menuActionRepository.GetByID(ctx, actionID)
	if err != nil {
		return fmt.Errorf("menu action not found: %w", err)
	}

	// 检查是否为系统动作
	if action.IsSystem {
		return errors.New("cannot delete system menu action")
	}

	err = uc.menuActionRepository.Delete(ctx, actionID)
	if err != nil {
		return fmt.Errorf("failed to delete menu action: %w", err)
	}

	return nil
}

// CheckMenuPermission 检查菜单权限
func (uc *menuUsecase) CheckMenuPermission(ctx context.Context, userID, tenantID, menuID string) (bool, error) {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	// 获取用户角色
	roles, err := uc.roleRepository.GetRolesByUserID(ctx, userID, tenantID)
	if err != nil {
		return false, err
	}

	// 检查任一角色是否有该菜单权限
	for _, role := range roles {
		menus, err := uc.roleRepository.GetMenusByRole(ctx, role.ID)
		if err != nil {
			continue
		}
		for _, menu := range menus {
			if menu.ID == menuID {
				return true, nil
			}
		}
	}

	return false, nil
}

// CheckActionPermission 检查动作权限
func (uc *menuUsecase) CheckActionPermission(ctx context.Context, userID, tenantID, permissionKey string) (bool, error) {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	// 获取动作信息
	action, err := uc.menuActionRepository.GetByPermissionKey(ctx, permissionKey)
	if err != nil {
		return false, nil // 如果动作不存在，认为没有权限
	}

	// 检查菜单权限
	return uc.CheckMenuPermission(ctx, userID, tenantID, action.MenuID)
}

// GetUserPermissions 获取用户所有权限
func (uc *menuUsecase) GetUserPermissions(ctx context.Context, userID, tenantID string) ([]string, error) {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	// 获取用户角色
	roles, err := uc.roleRepository.GetRolesByUserID(ctx, userID, tenantID)
	if err != nil {
		return nil, err
	}

	var permissions []string
	permissionSet := make(map[string]bool)

	// 收集所有角色的菜单权限
	for _, role := range roles {
		menus, err := uc.roleRepository.GetMenusByRole(ctx, role.ID)
		if err != nil {
			continue
		}
		for _, menu := range menus {
			for _, action := range menu.Actions {
				if !permissionSet[action.PermissionKey] {
					permissions = append(permissions, action.PermissionKey)
					permissionSet[action.PermissionKey] = true
				}
			}
		}
	}

	return permissions, nil
}

// buildUserMenuTree 构建用户菜单树
func (uc *menuUsecase) buildUserMenuTree(ctx context.Context, menuMap map[string]*domain.Menu) []*domain.MenuTreeNode {
	var rootNodes []*domain.MenuTreeNode
	nodeMap := make(map[string]*domain.MenuTreeNode)

	// 创建所有节点
	for _, menu := range menuMap {
		node := &domain.MenuTreeNode{
			Menu: menu,
		}
		nodeMap[menu.ID] = node
	}

	// 构建树结构
	for _, node := range nodeMap {
		if node.Menu.ParentID == nil {
			// 根节点
			rootNodes = append(rootNodes, node)
		} else {
			// 子节点
			if parent, exists := nodeMap[*node.Menu.ParentID]; exists {
				parent.Children = append(parent.Children, node)
			}
		}
	}

	return rootNodes
}