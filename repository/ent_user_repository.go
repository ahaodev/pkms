package repository

import (
	"context"
	"pkms/domain"
	"pkms/ent"
	"pkms/ent/tenant"
	"pkms/ent/user"
)

type entUserRepository struct {
	client *ent.Client
}

func NewUserRepository(client *ent.Client) domain.UserRepository {
	return &entUserRepository{
		client: client,
	}
}

func (ur *entUserRepository) Create(c context.Context, u *domain.User) error {
	created, err := ur.client.User.
		Create().
		SetUsername(u.Name).
		SetPasswordHash(u.Password).
		SetIsActive(u.IsActive).
		Save(c)

	if err != nil {
		return err
	}

	u.ID = created.ID
	u.IsActive = created.IsActive
	u.CreatedAt = created.CreatedAt
	u.UpdatedAt = created.UpdatedAt
	return nil
}

func (ur *entUserRepository) Fetch(c context.Context) ([]*domain.User, error) {
	// 查询所有用户，排除 admin 用户
	users, err := ur.client.User.
		Query().
		Select(user.FieldID, user.FieldUsername, user.FieldIsActive, user.FieldCreatedAt, user.FieldUpdatedAt).
		Where(user.Not(user.Username("admin"))).
		All(c)

	if err != nil {
		return nil, err
	}

	var result []*domain.User
	for _, u := range users {
		result = append(result, &domain.User{
			ID:        u.ID,
			Name:      u.Username,
			IsActive:  u.IsActive,
			CreatedAt: u.CreatedAt,
			UpdatedAt: u.UpdatedAt,
		})
	}

	return result, nil
}

func (ur *entUserRepository) GetByUserName(c context.Context, userName string) (*domain.User, error) {
	u, err := ur.client.User.
		Query().
		Where(user.Username(userName)).
		First(c)

	if err != nil {
		return nil, err
	}

	return &domain.User{
		ID:        u.ID,
		Name:      u.Username,
		Password:  u.PasswordHash,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}, nil
}

func (ur *entUserRepository) GetByID(c context.Context, id string) (*domain.User, error) {
	u, err := ur.client.User.
		Query().
		Where(user.ID(id)).
		First(c)

	if err != nil {
		return nil, err
	}
	t, err := u.QueryTenants().All(c)
	if err != nil {
		return nil, err
	}
	tenant := make([]*domain.Tenant, len(t))
	for i := range t {
		tenant[i] = &domain.Tenant{ID: t[i].ID, Name: t[i].Name}
	}
	return &domain.User{
		ID:        u.ID,
		Name:      u.Username,
		Password:  u.PasswordHash,
		Tenants:   tenant,
		IsActive:  u.IsActive,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}, nil
}

func (ur *entUserRepository) Update(c context.Context, u *domain.User) error {
	updateQuery := ur.client.User.
		UpdateOneID(u.ID).
		SetUsername(u.Name).
		SetIsActive(u.IsActive)

	// 🔒 如果提供了密码，则更新密码哈希
	if u.Password != "" {
		updateQuery = updateQuery.SetPasswordHash(u.Password)
	}

	updated, err := updateQuery.Save(c)

	if err != nil {
		return err
	}

	u.UpdatedAt = updated.UpdatedAt
	return nil
}

func (ur *entUserRepository) Delete(c context.Context, id string) error {
	return ur.client.User.
		DeleteOneID(id).
		Exec(c)
}

func (ur *entUserRepository) FetchByTenant(c context.Context, tenantID string) ([]*domain.User, error) {
	// Query users that belong to the specified tenant
	users, err := ur.client.User.
		Query().
		Where(user.HasTenantsWith(tenant.ID(tenantID))).
		Select(user.FieldID, user.FieldUsername, user.FieldIsActive, user.FieldCreatedAt, user.FieldUpdatedAt).
		All(c)

	if err != nil {
		return nil, err
	}

	var result []*domain.User
	for _, u := range users {
		result = append(result, &domain.User{
			ID:        u.ID,
			Name:      u.Username,
			IsActive:  u.IsActive,
			CreatedAt: u.CreatedAt,
			UpdatedAt: u.UpdatedAt,
		})
	}

	return result, nil
}
