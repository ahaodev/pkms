package repository

import (
	"context"
	"pkms/domain"
	"pkms/ent"
	"pkms/ent/user"
)

type tenantRepository struct {
	client *ent.Client
}

func (t tenantRepository) Create(c context.Context, tenant *domain.Tenant) error {
	_, err := t.client.Tenant.Create().SetID(tenant.ID).SetName(tenant.Name).Save(c)
	return err
}

func (t tenantRepository) GetTenantsByUserID(c context.Context, userID string) ([]domain.Tenant, error) {
	tenants, err := t.client.User.Query().Where(user.ID(userID)).QueryTenants().All(c)
	if err != nil {
		return nil, err
	}
	// ent db tenants convert to domain.Tenant
	var result []domain.Tenant
	for _, t := range tenants {
		result = append(result, domain.Tenant{
			ID:   t.ID,
			Name: t.Name,
		})
	}
	return result, nil
}

func NewTenantRepository(client *ent.Client) domain.TenantRepository {
	return &tenantRepository{
		client: client,
	}
}
