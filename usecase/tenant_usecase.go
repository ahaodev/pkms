package usecase

import (
	"context"
	"pkms/domain"
	"time"
)

type tenantUsecase struct {
	tenantRepository domain.TenantRepository
	contextTimeout   time.Duration
}

func (t tenantUsecase) Create(c context.Context, tenant *domain.Tenant) error {
	return t.tenantRepository.Create(c, tenant)
}

func (t tenantUsecase) GetTenantsByUserID(c context.Context, userID string) ([]domain.Tenant, error) {
	return t.tenantRepository.GetTenantsByUserID(c, userID)
}

func NewTenantUsecase(tenantRepository domain.TenantRepository, timeout time.Duration) domain.TenantUseCase {
	return &tenantUsecase{
		tenantRepository: tenantRepository,
		contextTimeout:   timeout,
	}
}
