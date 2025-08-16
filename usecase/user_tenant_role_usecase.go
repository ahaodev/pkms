package usecase

import (
	"context"
	"pkms/domain"
	"pkms/internal/casbin"
	"time"
)

type userTenantRoleUsecase struct {
	userTenantRoleRepository domain.UserTenantRoleRepository
	roleRepository           domain.RoleRepository
	tenantRepository         domain.TenantRepository
	casbinManager            *casbin.CasbinManager
	contextTimeout           time.Duration
}

func NewUserTenantRoleUsecase(
	userTenantRoleRepository domain.UserTenantRoleRepository,
	roleRepository domain.RoleRepository,
	tenantRepository domain.TenantRepository,
	casbinManager *casbin.CasbinManager,
	timeout time.Duration,
) domain.UserTenantRoleUsecase {
	return &userTenantRoleUsecase{
		userTenantRoleRepository: userTenantRoleRepository,
		roleRepository:           roleRepository,
		tenantRepository:         tenantRepository,
		casbinManager:            casbinManager,
		contextTimeout:           timeout,
	}
}

func (uu *userTenantRoleUsecase) AssignUserTenantRoles(ctx context.Context, req *domain.AssignUserTenantRoleRequest) error {
	ctx, cancel := context.WithTimeout(ctx, uu.contextTimeout)
	defer cancel()

	for _, assignment := range req.TenantRoles {
		// 获取角色信息以获取角色代码
		role, err := uu.roleRepository.GetByID(ctx, assignment.RoleID)
		if err != nil {
			return err
		}

		// 确保租户存在
		if _, err := uu.tenantRepository.GetByID(ctx, assignment.TenantID); err != nil {
			return err
		}

		// 创建用户租户角色关联
		userTenantRole := &domain.UserTenantRole{
			UserID:   req.UserID,
			TenantID: assignment.TenantID,
			RoleID:   assignment.RoleID,
		}

		if err := uu.userTenantRoleRepository.Create(ctx, userTenantRole); err != nil {
			// 如果已经存在，继续处理下一个
			continue
		}

		// 使用 Casbin 分配角色（使用角色代码）
		if err := uu.casbinManager.AddRoleForUser(req.UserID, role.Code, assignment.TenantID); err != nil {
			return err
		}
	}

	return nil
}

func (uu *userTenantRoleUsecase) RemoveUserTenantRole(ctx context.Context, req *domain.RemoveUserTenantRoleRequest) error {
	ctx, cancel := context.WithTimeout(ctx, uu.contextTimeout)
	defer cancel()

	// 获取用户租户角色关联
	userTenantRole, err := uu.userTenantRoleRepository.GetByUserTenantRole(ctx, req.UserID, req.TenantID, req.RoleID)
	if err != nil {
		return err
	}

	// 获取角色信息以获取角色代码
	role, err := uu.roleRepository.GetByID(ctx, req.RoleID)
	if err != nil {
		return err
	}

	// 删除用户租户角色关联
	if err := uu.userTenantRoleRepository.Delete(ctx, userTenantRole.ID); err != nil {
		return err
	}

	// 使用 Casbin 移除角色
	if err := uu.casbinManager.RemoveRoleForUser(req.UserID, role.Code, req.TenantID); err != nil {
		return err
	}

	return nil
}

func (uu *userTenantRoleUsecase) RemoveAllUserRolesInTenant(ctx context.Context, userID, tenantID string) error {
	ctx, cancel := context.WithTimeout(ctx, uu.contextTimeout)
	defer cancel()

	// 获取用户在该租户下的所有角色
	roles, err := uu.userTenantRoleRepository.GetRolesByUserTenant(ctx, userID, tenantID)
	if err != nil {
		return err
	}

	// 从数据库中删除所有关联
	if err := uu.userTenantRoleRepository.RemoveAllRolesFromUserInTenant(ctx, userID, tenantID); err != nil {
		return err
	}

	// 从 Casbin 中移除所有角色
	for _, role := range roles {
		if err := uu.casbinManager.RemoveRoleForUser(userID, role.Code, tenantID); err != nil {
			// 记录错误但继续处理
			continue
		}
	}

	return nil
}

func (uu *userTenantRoleUsecase) GetUserRolesByTenant(ctx context.Context, userID, tenantID string) ([]*domain.Role, error) {
	ctx, cancel := context.WithTimeout(ctx, uu.contextTimeout)
	defer cancel()

	return uu.userTenantRoleRepository.GetRolesByUserTenant(ctx, userID, tenantID)
}

func (uu *userTenantRoleUsecase) GetUsersByTenantRole(ctx context.Context, tenantID, roleID string) ([]*domain.User, error) {
	ctx, cancel := context.WithTimeout(ctx, uu.contextTimeout)
	defer cancel()

	return uu.userTenantRoleRepository.GetUsersByTenantRole(ctx, tenantID, roleID)
}

func (uu *userTenantRoleUsecase) GetAllUserTenantRoles(ctx context.Context, userID string) ([]*domain.UserTenantRole, error) {
	ctx, cancel := context.WithTimeout(ctx, uu.contextTimeout)
	defer cancel()

	return uu.userTenantRoleRepository.GetAllUserTenantRoles(ctx, userID)
}

func (uu *userTenantRoleUsecase) HasUserRoleInTenant(ctx context.Context, userID, tenantID, roleID string) (bool, error) {
	ctx, cancel := context.WithTimeout(ctx, uu.contextTimeout)
	defer cancel()

	_, err := uu.userTenantRoleRepository.GetByUserTenantRole(ctx, userID, tenantID, roleID)
	if err != nil {
		return false, nil // 不存在则返回 false
	}

	return true, nil
}

func (uu *userTenantRoleUsecase) CheckUserPermissionInTenant(ctx context.Context, userID, tenantID, resource, action string) (bool, error) {
	// 使用 Casbin 检查权限
	result, err := uu.casbinManager.Enforce(userID, tenantID, resource, action)
	if err != nil {
		return false, err
	}

	return result, nil
}