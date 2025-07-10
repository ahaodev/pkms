package domain

import (
	"context"
	"time"
)

type Group struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Color       string    `json:"color"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	MemberCount int       `json:"member_count"`
	CreatedBy   string    `json:"created_by"`
}

type GroupMembership struct {
	ID       int       `json:"id"`
	UserID   string    `json:"user_id"`
	GroupID  string    `json:"group_id"`
	JoinedAt time.Time `json:"joined_at"`
	AddedBy  string    `json:"added_by"`
}

type GroupRepository interface {
	Create(c context.Context, group *Group) error
	Fetch(c context.Context) ([]Group, error)
	GetByID(c context.Context, id string) (Group, error)
	Update(c context.Context, group *Group) error
	Delete(c context.Context, id string) error
	GetByUserID(c context.Context, userID string) ([]Group, error)
	AddMember(c context.Context, membership *GroupMembership) error
	RemoveMember(c context.Context, userID, groupID string) error
	GetMembers(c context.Context, groupID string) ([]User, error)
}

type GroupUsecase interface {
	Create(c context.Context, group *Group) error
	Fetch(c context.Context) ([]Group, error)
	GetByID(c context.Context, id string) (Group, error)
	Update(c context.Context, group *Group) error
	Delete(c context.Context, id string) error
	GetByUserID(c context.Context, userID string) ([]Group, error)
	AddMember(c context.Context, membership *GroupMembership) error
	RemoveMember(c context.Context, userID, groupID string) error
	GetMembers(c context.Context, groupID string) ([]User, error)
}
