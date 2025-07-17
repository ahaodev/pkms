package domain

import (
	"context"
	"time"
)

// Share 结构体定义了用户的基本信息
type Share struct {
	ID        string    `json:"id"`
	Code      string    `json:"-"`
	Path      string    `json:"role"`
	StartAt   time.Time `json:"start_at"`
	ExpiredAt time.Time `json:"expired_at" `
}

type ShareRepository interface {
	Create(c context.Context, user *User) error
	Fetch(c context.Context) ([]User, error)
	GetByUserName(c context.Context, userName string) (User, error)
	GetByID(c context.Context, id string) (User, error)
}

type ShareUseCase interface {
	Create(c context.Context, user *User) error
	Fetch(c context.Context) ([]User, error)
	GetByUserName(c context.Context, userName string) (User, error)
	GetByID(c context.Context, id string) (User, error)
}
