package domain

import "context"

type Tenant struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}
type TenantRepository interface {
	Create(c context.Context, user *User) error
	Fetch(c context.Context) ([]User, error)
	GetByUserName(c context.Context, userName string) (User, error)
	GetByID(c context.Context, id string) (User, error)
}

type TenantUseCase interface {
	Create(c context.Context, user *User) error
	Fetch(c context.Context) ([]User, error)
	GetByUserName(c context.Context, userName string) (User, error)
	GetByID(c context.Context, id string) (User, error)
}
