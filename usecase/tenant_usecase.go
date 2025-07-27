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

	// 为新租户初始化角色权限
	err = tu.casbinManager.InitializeRolePermissionsForTenant(tenant.ID)
	if err != nil {
		// 如果权限初始化失败，记录日志但不阻止租户创建
		// 可以在后续手动修复权限
		// 这里可以考虑是否要回滚租户创建
		return err
	}

	return nil
}

func (tu *tenantUsecase) Fetch(c context.Context) ([]domain.Tenant, error) {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()
	return tu.tenantRepository.Fetch(ctx)
}

func (tu *tenantUsecase) GetByID(c context.Context, id string) (domain.Tenant, error) {
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

func (tu *tenantUsecase) GetTenantsByUserID(c context.Context, userID string) ([]domain.Tenant, error) {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()
	return tu.tenantRepository.GetTenantsByUserID(ctx, userID)
}

func (tu *tenantUsecase) GetTenantUsers(c context.Context, tenantID string) ([]domain.User, error) {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()
	return tu.tenantRepository.GetTenantUsers(ctx, tenantID)
}

func (tu *tenantUsecase) AddUserToTenant(c context.Context, userID, tenantID string) error {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()
	return tu.tenantRepository.AddUserToTenant(ctx, userID, tenantID)
}

func (tu *tenantUsecase) RemoveUserFromTenant(c context.Context, userID, tenantID string) error {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()
	return tu.tenantRepository.RemoveUserFromTenant(ctx, userID, tenantID)
}

// GetTenantUsersWithRole 获取租户用户及其角色信息
func (tu *tenantUsecase) GetTenantUsersWithRole(c context.Context, tenantID string) ([]domain.TenantUser, error) {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()
	return tu.tenantRepository.GetTenantUsersWithRole(ctx, tenantID)
}

// AddUserToTenantWithRole 添加用户到租户并设置角色
func (tu *tenantUsecase) AddUserToTenantWithRole(c context.Context, userID, tenantID, role, createdBy string) error {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()

	// 验证角色是否有效
	validRoles := []string{domain.TenantRoleAdmin, domain.TenantRoleOwner, domain.TenantRoleViewer}
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

	return tu.tenantRepository.AddUserToTenantWithRole(ctx, userID, tenantID, role, createdBy)
}

// UpdateTenantUserRole 更新租户用户角色
func (tu *tenantUsecase) UpdateTenantUserRole(c context.Context, userID, tenantID, role string, isActive *bool) error {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()

	// 验证角色是否有效
	validRoles := []string{domain.TenantRoleAdmin, domain.TenantRoleOwner, domain.TenantRoleViewer}
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

	return tu.tenantRepository.UpdateTenantUserRole(ctx, userID, tenantID, role, isActive)
}

// GetTenantUserRole 获取用户在特定租户中的角色
func (tu *tenantUsecase) GetTenantUserRole(c context.Context, userID, tenantID string) (domain.TenantUser, error) {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()
	return tu.tenantRepository.GetTenantUserRole(ctx, userID, tenantID)
}

// GetUserTenants 获取用户所属的所有租户及角色信息
func (tu *tenantUsecase) GetUserTenants(c context.Context, userID string) ([]domain.TenantUser, error) {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()
	return tu.tenantRepository.GetUserTenants(ctx, userID)
}
