package usecase

import (
	"context"
	"errors"
	"fmt"
	"pkms/domain"
	"pkms/internal/casbin"
	"time"
)

type roleUsecase struct {
	roleRepository domain.RoleRepository
	menuRepository domain.MenuRepository
	userRepository domain.UserRepository
	casbinManager  *casbin.CasbinManager
	contextTimeout time.Duration
}

func NewRoleUsecase(
	roleRepo domain.RoleRepository,
	menuRepo domain.MenuRepository,
	userRepo domain.UserRepository,
	casbinManager *casbin.CasbinManager,
	timeout time.Duration,
) domain.RoleUsecase {
	return &roleUsecase{
		roleRepository: roleRepo,
		menuRepository: menuRepo,
		userRepository: userRepo,
		casbinManager:  casbinManager,
		contextTimeout: timeout,
	}
}

// CreateRole 创建角色
func (uc *roleUsecase) CreateRole(ctx context.Context, req *domain.CreateRoleRequest) (*domain.Role, error) {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	// 检查角色代码是否重复
	existing, err := uc.roleRepository.GetByCode(ctx, req.Code, req.TenantID)
	if err == nil && existing != nil {
		return nil, errors.New("role code already exists")
	}

	role := &domain.Role{
		Name:        req.Name,
		Code:        req.Code,
		Description: req.Description,
		TenantID:    req.TenantID,
		IsSystem:    false, // 用户创建的角色默认非系统角色
		IsActive:    true,  // 新创建的角色默认启用
	}

	err = uc.roleRepository.Create(ctx, role)
	if err != nil {
		return nil, fmt.Errorf("failed to create role: %w", err)
	}

	// 如果指定了菜单，关联菜单
	if len(req.MenuIDs) > 0 {
		err = uc.AssignMenusToRole(ctx, role.ID, req.MenuIDs)
		if err != nil {
			// 如果关联菜单失败，删除已创建的角色
			_ = uc.roleRepository.Delete(ctx, role.ID)
			return nil, fmt.Errorf("failed to assign menus to role: %w", err)
		}
	}

	return role, nil
}

// GetRoleByID 根据ID获取角色
func (uc *roleUsecase) GetRoleByID(ctx context.Context, id string) (*domain.Role, error) {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	return uc.roleRepository.GetByID(ctx, id)
}

// GetRolesByTenant 获取租户的所有角色
func (uc *roleUsecase) GetRolesByTenant(ctx context.Context, tenantID string) ([]*domain.Role, error) {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	return uc.roleRepository.GetByTenant(ctx, tenantID)
}

// UpdateRole 更新角色
func (uc *roleUsecase) UpdateRole(ctx context.Context, id string, req *domain.UpdateRoleRequest) (*domain.Role, error) {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	// 获取现有角色
	role, err := uc.roleRepository.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("role not found: %w", err)
	}

	// 检查是否为系统角色
	if role.IsSystem {
		return nil, errors.New("cannot modify system role")
	}

	// 更新字段
	if req.Name != "" {
		role.Name = req.Name
	}
	if req.Description != "" {
		role.Description = req.Description
	}
	if req.IsActive != nil {
		role.IsActive = *req.IsActive
		
		// 如果角色被禁用，需要从Casbin中移除相关策略
		if !*req.IsActive {
			err = uc.removeRoleFromCasbin(ctx, role.Code, role.TenantID)
			if err != nil {
				return nil, fmt.Errorf("failed to remove role from casbin: %w", err)
			}
		}
	}

	err = uc.roleRepository.Update(ctx, role)
	if err != nil {
		return nil, fmt.Errorf("failed to update role: %w", err)
	}

	// 如果指定了菜单，更新菜单关联
	if req.MenuIDs != nil {
		// 先清除现有关联
		currentMenus, err := uc.roleRepository.GetMenusByRole(ctx, id)
		if err != nil {
			return nil, fmt.Errorf("failed to get current menus: %w", err)
		}
		
		var currentMenuIDs []string
		for _, menu := range currentMenus {
			currentMenuIDs = append(currentMenuIDs, menu.ID)
		}
		
		if len(currentMenuIDs) > 0 {
			err = uc.roleRepository.RemoveMenusFromRole(ctx, id, currentMenuIDs)
			if err != nil {
				return nil, fmt.Errorf("failed to remove current menus: %w", err)
			}
		}

		// 添加新的关联
		if len(req.MenuIDs) > 0 {
			err = uc.roleRepository.AssignMenusToRole(ctx, id, req.MenuIDs)
			if err != nil {
				return nil, fmt.Errorf("failed to assign new menus: %w", err)
			}
		}

		// 更新Casbin策略
		err = uc.updateRolePermissionsInCasbin(ctx, role)
		if err != nil {
			return nil, fmt.Errorf("failed to update casbin policies: %w", err)
		}
	}

	return role, nil
}

// DeleteRole 删除角色
func (uc *roleUsecase) DeleteRole(ctx context.Context, id string) error {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	// 获取角色信息
	role, err := uc.roleRepository.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("role not found: %w", err)
	}

	// 检查是否为系统角色
	if role.IsSystem {
		return errors.New("cannot delete system role")
	}

	// 检查是否有用户关联
	users, err := uc.roleRepository.GetUsersByRoleID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check role users: %w", err)
	}
	if len(users) > 0 {
		return errors.New("cannot delete role with assigned users")
	}

	// 从Casbin中移除相关策略
	err = uc.removeRoleFromCasbin(ctx, role.Code, role.TenantID)
	if err != nil {
		return fmt.Errorf("failed to remove role from casbin: %w", err)
	}

	// 删除角色
	err = uc.roleRepository.Delete(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete role: %w", err)
	}

	return nil
}

// AssignRoleToUsers 为用户分配角色
func (uc *roleUsecase) AssignRoleToUsers(ctx context.Context, roleID string, req *domain.AssignRoleRequest) error {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	// 验证角色是否存在且启用
	role, err := uc.roleRepository.GetByID(ctx, roleID)
	if err != nil {
		return fmt.Errorf("role not found: %w", err)
	}
	if !role.IsActive {
		return errors.New("cannot assign inactive role")
	}

	// 为每个用户分配角色
	for _, userID := range req.UserIDs {
		// 验证用户是否存在
		_, err := uc.userRepository.GetByID(ctx, userID)
		if err != nil {
			return fmt.Errorf("user %s not found: %w", userID, err)
		}

		// 分配角色
		err = uc.roleRepository.AssignRoleToUser(ctx, roleID, userID)
		if err != nil {
			return fmt.Errorf("failed to assign role to user %s: %w", userID, err)
		}

		// 在Casbin中添加用户角色关联
		err = uc.casbinManager.AddRoleForUserInTenant(userID, role.Code, role.TenantID)
		if err != nil {
			return fmt.Errorf("failed to add casbin role for user %s: %w", userID, err)
		}
	}

	return nil
}

// RemoveRoleFromUsers 移除用户的角色
func (uc *roleUsecase) RemoveRoleFromUsers(ctx context.Context, roleID string, userIDs []string) error {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	// 获取角色信息
	role, err := uc.roleRepository.GetByID(ctx, roleID)
	if err != nil {
		return fmt.Errorf("role not found: %w", err)
	}

	// 为每个用户移除角色
	for _, userID := range userIDs {
		// 移除角色
		err = uc.roleRepository.RemoveRoleFromUser(ctx, roleID, userID)
		if err != nil {
			return fmt.Errorf("failed to remove role from user %s: %w", userID, err)
		}

		// 从Casbin中移除用户角色关联
		err = uc.casbinManager.DeleteRoleForUserInTenant(userID, role.Code, role.TenantID)
		if err != nil {
			return fmt.Errorf("failed to remove casbin role for user %s: %w", userID, err)
		}
	}

	return nil
}

// GetUsersByRole 获取拥有指定角色的用户
func (uc *roleUsecase) GetUsersByRole(ctx context.Context, roleID string) ([]*domain.User, error) {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	return uc.roleRepository.GetUsersByRoleID(ctx, roleID)
}

// GetRolesByUser 获取用户的角色
func (uc *roleUsecase) GetRolesByUser(ctx context.Context, userID, tenantID string) ([]*domain.Role, error) {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	return uc.roleRepository.GetRolesByUserID(ctx, userID, tenantID)
}

// AssignMenusToRole 为角色分配菜单
func (uc *roleUsecase) AssignMenusToRole(ctx context.Context, roleID string, menuIDs []string) error {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	// 验证所有菜单是否存在
	for _, menuID := range menuIDs {
		_, err := uc.menuRepository.GetByID(ctx, menuID)
		if err != nil {
			return fmt.Errorf("menu %s not found: %w", menuID, err)
		}
	}

	// 分配菜单
	err := uc.roleRepository.AssignMenusToRole(ctx, roleID, menuIDs)
	if err != nil {
		return fmt.Errorf("failed to assign menus to role: %w", err)
	}

	// 更新Casbin策略
	role, err := uc.roleRepository.GetByID(ctx, roleID)
	if err != nil {
		return fmt.Errorf("failed to get role: %w", err)
	}

	err = uc.updateRolePermissionsInCasbin(ctx, role)
	if err != nil {
		return fmt.Errorf("failed to update casbin policies: %w", err)
	}

	return nil
}

// GetRolePermissions 获取角色权限
func (uc *roleUsecase) GetRolePermissions(ctx context.Context, roleID string) ([]*domain.RolePermission, error) {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	// 获取角色关联的菜单
	menus, err := uc.roleRepository.GetMenusByRole(ctx, roleID)
	if err != nil {
		return nil, fmt.Errorf("failed to get role menus: %w", err)
	}

	var permissions []*domain.RolePermission
	for _, menu := range menus {
		for _, action := range menu.Actions {
			permission := &domain.RolePermission{
				RoleID:        roleID,
				MenuID:        menu.ID,
				PermissionKey: action.PermissionKey,
				Resource:      action.Resource,
				Action:        action.Code,
			}
			permissions = append(permissions, permission)
		}
	}

	return permissions, nil
}

// InitializeSystemRoles 初始化系统角色
func (uc *roleUsecase) InitializeSystemRoles(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	// 定义系统角色
	systemRoles := []*domain.Role{
		{
			Name:        "系统管理员",
			Code:        "admin",
			Description: "系统管理员，拥有所有权限",
			IsSystem:    true,
			IsActive:    true,
		},
		{
			Name:        "租户管理员",
			Code:        "owner",
			Description: "租户管理员，管理租户内的项目和用户",
			IsSystem:    true,
			IsActive:    true,
		},
		{
			Name:        "普通用户",
			Code:        "user",
			Description: "普通用户，具有基本的操作权限",
			IsSystem:    true,
			IsActive:    true,
		},
		{
			Name:        "访客用户",
			Code:        "viewer",
			Description: "访客用户，只有查看权限",
			IsSystem:    true,
			IsActive:    true,
		},
	}

	// 创建系统角色
	for _, role := range systemRoles {
		// 检查角色是否已存在
		existing, err := uc.roleRepository.GetByCode(ctx, role.Code, "")
		if err == nil && existing != nil {
			continue // 角色已存在，跳过
		}

		err = uc.roleRepository.Create(ctx, role)
		if err != nil {
			return fmt.Errorf("failed to create system role %s: %w", role.Code, err)
		}
	}

	return nil
}

// EnsureSystemRolesExist 确保系统角色存在
func (uc *roleUsecase) EnsureSystemRolesExist(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, uc.contextTimeout)
	defer cancel()

	systemRoleCodes := []string{"admin", "owner", "user", "viewer"}
	
	for _, code := range systemRoleCodes {
		_, err := uc.roleRepository.GetByCode(ctx, code, "")
		if err != nil {
			// 系统角色不存在，需要初始化
			return uc.InitializeSystemRoles(ctx)
		}
	}

	return nil
}

// updateRolePermissionsInCasbin 更新Casbin中的角色权限策略
func (uc *roleUsecase) updateRolePermissionsInCasbin(ctx context.Context, role *domain.Role) error {
	// 获取角色的所有菜单权限
	permissions, err := uc.GetRolePermissions(ctx, role.ID)
	if err != nil {
		return err
	}

	// 清除现有策略（需要根据具体实现）
	// 这里简化处理，实际应该更精确地管理策略

	// 添加新策略
	for _, perm := range permissions {
		_, err = uc.casbinManager.AddPolicy(role.Code, role.TenantID, perm.Resource, perm.Action)
		if err != nil {
			return fmt.Errorf("failed to add casbin policy: %w", err)
		}
	}

	return nil
}

// removeRoleFromCasbin 从Casbin中移除角色相关策略
func (uc *roleUsecase) removeRoleFromCasbin(ctx context.Context, roleCode, tenantID string) error {
	// 移除角色的所有策略
	// 这里需要根据Casbin的具体实现来处理
	// 简化处理，实际实现可能需要更精确的策略管理
	
	return nil
}