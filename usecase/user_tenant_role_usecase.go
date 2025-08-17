package usecase

import (
	"context"
	"fmt"
	"pkms/domain"
	"pkms/internal/casbin"
	"time"
)

type userTenantRoleUsecase struct {
	userTenantRoleRepository domain.UserTenantRoleRepository
	tenantRepository         domain.TenantRepository
	casbinManager            *casbin.CasbinManager
	contextTimeout           time.Duration
}

func NewUserTenantRoleUsecase(
	userTenantRoleRepository domain.UserTenantRoleRepository,
	tenantRepository domain.TenantRepository,
	casbinManager *casbin.CasbinManager,
	timeout time.Duration,
) domain.UserTenantRoleUsecase {
	return &userTenantRoleUsecase{
		userTenantRoleRepository: userTenantRoleRepository,
		tenantRepository:         tenantRepository,
		casbinManager:            casbinManager,
		contextTimeout:           timeout,
	}
}

// AssignUserTenantRoles 分配用户租户角色
func (uu *userTenantRoleUsecase) AssignUserTenantRoles(ctx context.Context, req *domain.AssignUserTenantRoleRequest) error {
	ctx, cancel := context.WithTimeout(ctx, uu.contextTimeout)
	defer cancel()

	for _, tenantRole := range req.TenantRoles {
		// 验证角色代码是否有效
		if !isValidRoleCode(tenantRole.RoleCode) {
			return fmt.Errorf("invalid role code: %s", tenantRole.RoleCode)
		}

		// 创建用户租户角色关联
		userTenantRole := &domain.UserTenantRole{
			UserID:   req.UserID,
			TenantID: tenantRole.TenantID,
			RoleCode: tenantRole.RoleCode,
		}

		if err := uu.userTenantRoleRepository.Create(ctx, userTenantRole); err != nil {
			return fmt.Errorf("failed to assign role %s to user %s in tenant %s: %w", 
				tenantRole.RoleCode, req.UserID, tenantRole.TenantID, err)
		}

		// 同步到Casbin
		err := uu.casbinManager.AddRoleForUserInTenant(req.UserID, tenantRole.RoleCode, tenantRole.TenantID)
		if err != nil {
			return fmt.Errorf("failed to add casbin role: %w", err)
		}
	}

	return nil
}

// RemoveUserTenantRole 移除用户租户角色
func (uu *userTenantRoleUsecase) RemoveUserTenantRole(ctx context.Context, req *domain.RemoveUserTenantRoleRequest) error {
	ctx, cancel := context.WithTimeout(ctx, uu.contextTimeout)
	defer cancel()

	// 查找并删除关联
	userTenantRole, err := uu.userTenantRoleRepository.GetByUserTenantRole(ctx, req.UserID, req.TenantID, req.RoleCode)
	if err != nil {
		return fmt.Errorf("user tenant role not found: %w", err)
	}

	if err := uu.userTenantRoleRepository.Delete(ctx, userTenantRole.ID); err != nil {
		return fmt.Errorf("failed to remove user tenant role: %w", err)
	}

	// 角色现在使用固定常量，不需要从Casbin中移除角色关联
	// 权限检查直接基于数据库中的用户租户角色关联

	return nil
}

// RemoveAllUserRolesInTenant 移除用户在租户下的所有角色
func (uu *userTenantRoleUsecase) RemoveAllUserRolesInTenant(ctx context.Context, userID, tenantID string) error {
	ctx, cancel := context.WithTimeout(ctx, uu.contextTimeout)
	defer cancel()

	// 从数据库中删除
	if err := uu.userTenantRoleRepository.RemoveAllRolesFromUserInTenant(ctx, userID, tenantID); err != nil {
		return fmt.Errorf("failed to remove roles from database: %w", err)
	}

	// 角色现在使用固定常量，权限检查直接基于数据库

	return nil
}

// GetUserRolesByTenant 获取用户在租户下的角色
func (uu *userTenantRoleUsecase) GetUserRolesByTenant(ctx context.Context, userID, tenantID string) ([]string, error) {
	ctx, cancel := context.WithTimeout(ctx, uu.contextTimeout)
	defer cancel()

	return uu.userTenantRoleRepository.GetRoleCodesByUserTenant(ctx, userID, tenantID)
}

// GetUsersByTenantRole 获取租户下拥有指定角色的用户
func (uu *userTenantRoleUsecase) GetUsersByTenantRole(ctx context.Context, tenantID, roleCode string) ([]*domain.User, error) {
	ctx, cancel := context.WithTimeout(ctx, uu.contextTimeout)
	defer cancel()

	return uu.userTenantRoleRepository.GetUsersByTenantRole(ctx, tenantID, roleCode)
}

// GetAllUserTenantRoles 获取用户的所有租户角色
func (uu *userTenantRoleUsecase) GetAllUserTenantRoles(ctx context.Context, userID string) ([]*domain.UserTenantRole, error) {
	ctx, cancel := context.WithTimeout(ctx, uu.contextTimeout)
	defer cancel()

	return uu.userTenantRoleRepository.GetAllUserTenantRoles(ctx, userID)
}

// HasUserRoleInTenant 检查用户在租户下是否有指定角色
func (uu *userTenantRoleUsecase) HasUserRoleInTenant(ctx context.Context, userID, tenantID, roleCode string) (bool, error) {
	ctx, cancel := context.WithTimeout(ctx, uu.contextTimeout)
	defer cancel()

	_, err := uu.userTenantRoleRepository.GetByUserTenantRole(ctx, userID, tenantID, roleCode)
	if err != nil {
		return false, nil // 如果找不到，说明没有此角色
	}
	return true, nil
}

// CheckUserPermissionInTenant 检查用户在租户下的权限
func (uu *userTenantRoleUsecase) CheckUserPermissionInTenant(ctx context.Context, userID, tenantID, resource, action string) (bool, error) {
	result, err := uu.casbinManager.CheckPermission(userID, tenantID, resource, action)
	return result, err
}

// isValidRoleCode 检查角色代码是否有效
func isValidRoleCode(roleCode string) bool {
	validRoles := []string{
		domain.SystemRoleAdmin,
		domain.TenantRoleOwner,
		domain.TenantRoleUser,
		domain.TenantRoleViewer,
	}
	
	for _, valid := range validRoles {
		if roleCode == valid {
			return true
		}
	}
	return false
}