package domain

import (
	"context"
)

type Permission struct {
	ID        string `json:"id"`
	UserID    string `json:"user_id"`
	ProjectID string `json:"project_id"`
	CanView   bool   `json:"can_view"`
	CanEdit   bool   `json:"can_edit"`
	CanDelete bool   `json:"can_delete"`
	CanManage bool   `json:"can_manage"`
}

type GroupPermission struct {
	ID        string `json:"id"`
	GroupID   string `json:"group_id"`
	ProjectID string `json:"project_id"`
	CanView   bool   `json:"can_view"`
	CanEdit   bool   `json:"can_edit"`
	CanDelete bool   `json:"can_delete"`
	CanManage bool   `json:"can_manage"`
}

type PermissionRepository interface {
	CreateUserPermission(c context.Context, permission *Permission) error
	CreateGroupPermission(c context.Context, permission *GroupPermission) error
	GetUserPermissions(c context.Context, userID string) ([]Permission, error)
	GetGroupPermissions(c context.Context, groupID string) ([]GroupPermission, error)
	GetProjectPermissions(c context.Context, projectID string) ([]Permission, error)
	UpdateUserPermission(c context.Context, permission *Permission) error
	UpdateGroupPermission(c context.Context, permission *GroupPermission) error
	DeleteUserPermission(c context.Context, userID, projectID string) error
	DeleteGroupPermission(c context.Context, groupID, projectID string) error
	CheckUserPermission(c context.Context, userID, projectID string) (Permission, error)
}

type PermissionUsecase interface {
	CreateUserPermission(c context.Context, permission *Permission) error
	CreateGroupPermission(c context.Context, permission *GroupPermission) error
	GetUserPermissions(c context.Context, userID string) ([]Permission, error)
	GetGroupPermissions(c context.Context, groupID string) ([]GroupPermission, error)
	GetProjectPermissions(c context.Context, projectID string) ([]Permission, error)
	UpdateUserPermission(c context.Context, permission *Permission) error
	UpdateGroupPermission(c context.Context, permission *GroupPermission) error
	DeleteUserPermission(c context.Context, userID, projectID string) error
	DeleteGroupPermission(c context.Context, groupID, projectID string) error
	CheckUserPermission(c context.Context, userID, projectID string) (Permission, error)
	HasPermission(c context.Context, userID, projectID string, action string) (bool, error)
}
