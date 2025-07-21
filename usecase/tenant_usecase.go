package usecase

import (
	"context"
	"time"

	"pkms/domain"
)

type tenantUsecase struct {
	tenantRepository domain.TenantRepository
	contextTimeout   time.Duration
}

func NewTenantUsecase(tenantRepository domain.TenantRepository, timeout time.Duration) domain.TenantUseCase {
	return &tenantUsecase{
		tenantRepository: tenantRepository,
		contextTimeout:   timeout,
	}
}

func (tu *tenantUsecase) Create(c context.Context, tenant *domain.Tenant) error {
	ctx, cancel := context.WithTimeout(c, tu.contextTimeout)
	defer cancel()
	return tu.tenantRepository.Create(ctx, tenant)
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
