package domain

import (
	"context"
	"time"
)

type Tenant struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type TenantRepository interface {
	Create(c context.Context, tenant *Tenant) error
	Fetch(c context.Context) ([]Tenant, error)
	GetByID(c context.Context, id string) (Tenant, error)
	Update(c context.Context, tenant *Tenant) error
	Delete(c context.Context, id string) error
	GetTenantsByUserID(c context.Context, userID string) ([]Tenant, error)
	GetTenantUsers(c context.Context, tenantID string) ([]User, error)
	AddUserToTenant(c context.Context, userID, tenantID string) error
	RemoveUserFromTenant(c context.Context, userID, tenantID string) error
}

type TenantUseCase interface {
	Create(c context.Context, tenant *Tenant) error
	Fetch(c context.Context) ([]Tenant, error)
	GetByID(c context.Context, id string) (Tenant, error)
	Update(c context.Context, tenant *Tenant) error
	Delete(c context.Context, id string) error
	GetTenantsByUserID(c context.Context, userID string) ([]Tenant, error)
	GetTenantUsers(c context.Context, tenantID string) ([]User, error)
	AddUserToTenant(c context.Context, userID, tenantID string) error
	RemoveUserFromTenant(c context.Context, userID, tenantID string) error
}
