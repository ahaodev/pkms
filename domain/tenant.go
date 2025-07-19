package domain

import "context"

type Tenant struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}
type TenantRepository interface {
	Create(c context.Context, tenant *Tenant) error
	// GetTenantsByUserID Get user tenants by user ID
	GetTenantsByUserID(c context.Context, userID string) ([]Tenant, error)
}

type TenantUseCase interface {
	Create(c context.Context, tenant *Tenant) error
	GetTenantsByUserID(c context.Context, userID string) ([]Tenant, error)
}
