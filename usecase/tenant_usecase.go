package usecase

import (
	"context"
	"fmt"
	"time"

	"pkms/domain"
	"pkms/internal/casbin"
)

type tenantUsecase struct {
	tenantRepository domain.TenantRepository
	casbinManager    *casbin.CasbinManager
	contextTimeout   time.Duration
}

func NewTenantUsecase(tenantRepository domain.TenantRepository, casbinManager *casbin.CasbinManager, timeout time.Duration) domain.TenantUseCase {
	return &tenantUsecase{
		tenantRepository: tenantRepository,
		casbinManager:    casbinManager,
		contextTimeout:   timeout,
	}
}

func (tu *tenantUsecase) Create(c context.Context, tenant *domain.Tenant) error {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()

	// 首先创建租户
	err := tu.tenantRepository.Create(ctx, tenant)
	if err != nil {
		return err
	}
	return nil
}

func (tu *tenantUsecase) Fetch(c context.Context) ([]*domain.Tenant, error) {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()
	return tu.tenantRepository.Fetch(ctx)
}

func (tu *tenantUsecase) FetchPaged(c context.Context, params domain.QueryParams) (*domain.TenantPagedResult, error) {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()
	return tu.tenantRepository.FetchPaged(ctx, params)
}

func (tu *tenantUsecase) GetByID(c context.Context, id string) (*domain.Tenant, error) {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()
	return tu.tenantRepository.GetByID(ctx, id)
}

func (tu *tenantUsecase) Update(c context.Context, tenant *domain.Tenant) error {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()
	return tu.tenantRepository.Update(ctx, tenant)
}

func (tu *tenantUsecase) Delete(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()
	return tu.tenantRepository.Delete(ctx, id)
}

func (tu *tenantUsecase) GetTenantsByUserID(c context.Context, user string) ([]*domain.Tenant, error) {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()
	return tu.tenantRepository.GetTenantsByUserID(ctx, user)
}

func (tu *tenantUsecase) GetTenantUsers(c context.Context, tenant string) ([]*domain.User, error) {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()
	return tu.tenantRepository.GetTenantUsers(ctx, tenant)
}

func (tu *tenantUsecase) AddUserToTenant(c context.Context, user, tenant string) error {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()
	return tu.tenantRepository.AddUserToTenant(ctx, user, tenant)
}

func (tu *tenantUsecase) RemoveUserFromTenant(c context.Context, user, tenant string) error {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()

	// 先从 Casbin 中删除用户在该租户中的所有角色
	err := tu.casbinManager.DeleteAllRolesForUserInTenant(user, tenant)
	if err != nil {
		return fmt.Errorf("删除用户角色失败: %v", err)
	}

	// 然后从数据库中移除用户与租户的关联
	return tu.tenantRepository.RemoveUserFromTenant(ctx, user, tenant)
}

// GetTenantUsersWithRole 获取租户用户及其角色信息
func (tu *tenantUsecase) GetTenantUsersWithRole(c context.Context, tenant string) ([]*domain.TenantUser, error) {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()
	return tu.tenantRepository.GetTenantUsersWithRole(ctx, tenant)
}

// AddUserToTenantWithRole 添加用户到租户并设置角色
func (tu *tenantUsecase) AddUserToTenantWithRole(c context.Context, user, tenant, role, createdBy string) error {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()

	// 验证角色是否有效
	validRoles := []string{domain.SystemRoleAdmin, domain.TenantRoleOwner, domain.TenantRoleUser, domain.TenantRoleViewer}
	validRole := false
	for _, vr := range validRoles {
		if role == vr {
			validRole = true
			break
		}
	}
	if !validRole {
		return fmt.Errorf("无效的角色: %s", role)
	}

	// 添加用户到租户
	err := tu.tenantRepository.AddUserToTenantWithRole(ctx, user, tenant, role, createdBy)
	if err != nil {
		return err
	}

	// 通过 Casbin 为用户在租户中分配角色
	err = tu.casbinManager.AddRoleForUserInTenant(user, role, tenant)
	tu.casbinManager.AddPolicy(role, tenant, "*", "*")
	if err != nil {
		return fmt.Errorf("角色分配失败: %v", err)
	}

	return nil
}

// UpdateTenantUserRole 更新租户用户角色
func (tu *tenantUsecase) UpdateTenantUserRole(c context.Context, user, tenant, role string, isActive *bool) error {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()

	// 验证角色是否有效
	validRoles := []string{domain.SystemRoleAdmin, domain.TenantRoleOwner, domain.TenantRoleUser, domain.TenantRoleViewer}
	validRole := false
	for _, vr := range validRoles {
		if role == vr {
			validRole = true
			break
		}
	}
	if !validRole {
		return fmt.Errorf("无效的角色: %s", role)
	}

	// 先删除用户在该租户中的所有角色
	err := tu.casbinManager.DeleteAllRolesForUserInTenant(user, tenant)
	if err != nil {
		return fmt.Errorf("删除用户角色失败: %v", err)
	}

	// 重新分配新角色
	err = tu.casbinManager.AddRoleForUserInTenant(user, role, tenant)
	if err != nil {
		return fmt.Errorf("分配新角色失败: %v", err)
	}

	return tu.tenantRepository.UpdateTenantUserRole(ctx, user, tenant, role, isActive)
}

// GetTenantUserRole 获取用户在特定租户中的角色
func (tu *tenantUsecase) GetTenantUserRole(c context.Context, user, tenant string) (*domain.TenantUser, error) {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()
	return tu.tenantRepository.GetTenantUserRole(ctx, user, tenant)
}

// GetUserTenants 获取用户所属的所有租户及角色信息
func (tu *tenantUsecase) GetUserTenants(c context.Context, user string) ([]*domain.TenantUser, error) {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()
	return tu.tenantRepository.GetUserTenants(ctx, user)
}
