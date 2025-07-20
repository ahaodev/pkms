package domain

import (
	"context"
	"time"
)

// User 结构体定义了用户的基本信息
type User struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Password  string    `json:"-"`
	Tenants   []*Tenant `json:"tenants"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type UserRepository interface {
	Create(c context.Context, user *User) error
	Fetch(c context.Context) ([]User, error)
	GetByUserName(c context.Context, userName string) (User, error)
	GetByID(c context.Context, id string) (User, error)
}

type UserUseCase interface {
	Create(c context.Context, user *User) error
	Fetch(c context.Context) ([]User, error)
	GetByUserName(c context.Context, userName string) (User, error)
	GetByID(c context.Context, id string) (User, error)
}
