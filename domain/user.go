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
	FetchByTenant(c context.Context, tenantID string) ([]User, error)
	GetByUserName(c context.Context, userName string) (User, error)
	GetByID(c context.Context, id string) (User, error)
	Update(c context.Context, user *User) error
	Delete(c context.Context, id string) error
	GetUserProjects(c context.Context, userID string) ([]Project, error)
}

type UserUseCase interface {
	Create(c context.Context, user *User) error
	Fetch(c context.Context) ([]User, error)
	GetByUserName(c context.Context, userName string) (User, error)
	GetByID(c context.Context, id string) (User, error)
	Update(c context.Context, user *User) error
	Delete(c context.Context, id string) error
	GetUserProjects(c context.Context, userID string) ([]Project, error)
	UpdateProfile(c context.Context, userID string, updates ProfileUpdate) error
	AssignUserToProject(c context.Context, userID, projectID string) error
	UnassignUserFromProject(c context.Context, userID, projectID string) error
}

// ProfileUpdate represents profile update data
type ProfileUpdate struct {
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
}
