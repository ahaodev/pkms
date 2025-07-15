package repository

import (
	"context"
	"strconv"
	"time"

	"pkms/domain"
	"pkms/ent"
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
		SetRole(user.Role(u.Role)).
		Save(c)

	if err != nil {
		return err
	}

	u.ID = created.ID
	u.CreatedAt = created.CreatedAt
	u.UpdatedAt = created.UpdatedAt
	return nil
}

// generateUniqueID generates a unique ID for entities
func generateUniqueID() string {
	// For now, we'll use a simple timestamp-based ID
	// In production, you might want to use UUID or nanoid
	return strconv.FormatInt(time.Now().UnixNano(), 36)
}

func (ur *entUserRepository) Fetch(c context.Context) ([]domain.User, error) {
	users, err := ur.client.User.
		Query().
		Select(user.FieldID, user.FieldUsername, user.FieldCreatedAt, user.FieldUpdatedAt).
		All(c)

	if err != nil {
		return nil, err
	}

	var result []domain.User
	for _, u := range users {
		result = append(result, domain.User{
			ID:        u.ID,
			Name:      u.Username,
			CreatedAt: u.CreatedAt,
			UpdatedAt: u.UpdatedAt,
		})
	}

	return result, nil
}

func (ur *entUserRepository) GetByUserName(c context.Context, userName string) (domain.User, error) {
	u, err := ur.client.User.
		Query().
		Where(user.Username(userName)).
		First(c)

	if err != nil {
		return domain.User{}, err
	}

	return domain.User{
		ID:        u.ID,
		Name:      u.Username,
		Role:      u.Role.String(),
		Password:  u.PasswordHash,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}, nil
}

func (ur *entUserRepository) GetByID(c context.Context, id string) (domain.User, error) {
	u, err := ur.client.User.
		Query().
		Where(user.ID(id)).
		First(c)

	if err != nil {
		return domain.User{}, err
	}

	return domain.User{
		ID:        u.ID,
		Name:      u.Username,
		Role:      u.Role.String(),
		Password:  u.PasswordHash,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}, nil
}
