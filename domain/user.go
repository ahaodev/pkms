package domain

import (
	"context"
	"errors"
	"time"
)

var (
	ErrInvalidPassword = errors.New("invalid password")
)

// User 结构体定义了用户的基本信息
type User struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Password  string    `json:"password"`
	Tenants   []*Tenant `json:"tenants"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type UserRepository interface {
	Create(c context.Context, user *User) error
	Fetch(c context.Context) ([]*User, error)
	FetchByTenant(c context.Context, tenantID string) ([]*User, error)
	GetByUserName(c context.Context, userName string) (*User, error)
	GetByID(c context.Context, id string) (*User, error)
	Update(c context.Context, user *User) error
	Delete(c context.Context, id string) error
}

type UserUseCase interface {
	Create(c context.Context, user *User) error
	Fetch(c context.Context) ([]*User, error)
	GetByID(c context.Context, id string) (*User, error)
	Update(c context.Context, user *User) error
	Delete(c context.Context, id string) error
	UpdateProfile(c context.Context, userID string, updates ProfileUpdate) error
	UpdatePassword(c context.Context, userID string, passwordUpdate PasswordUpdate) error
	UpdatePartial(c context.Context, userID string, updates UserUpdateRequest) error
}
