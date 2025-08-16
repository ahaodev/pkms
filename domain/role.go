package domain

import (
	"context"
	"time"
)

// Role 角色实体
type Role struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Code        string    `json:"code"`
	Description string    `json:"description,omitempty"`
	TenantID    string    `json:"tenant_id,omitempty"`
	IsSystem    bool      `json:"is_system"`
	IsActive    bool      `json:"is_active"`
	Menus       []*Menu   `json:"menus,omitempty"`
	Users       []*User   `json:"users,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// CreateRoleRequest 创建角色请求
type CreateRoleRequest struct {
	Name        string   `json:"name" binding:"required"`
	Code        string   `json:"code" binding:"required"`
	Description string   `json:"description,omitempty"`
	TenantID    string   `json:"tenant_id" binding:"required"` // 必须绑定租户
	MenuIDs     []string `json:"menu_ids,omitempty"`
}

// UpdateRoleRequest 更新角色请求
type UpdateRoleRequest struct {
	Name        string   `json:"name,omitempty"`
	Description string   `json:"description,omitempty"`
	IsActive    *bool    `json:"is_active,omitempty"`
	MenuIDs     []string `json:"menu_ids,omitempty"`
}

// AssignRoleRequest 分配角色请求
type AssignRoleRequest struct {
	UserIDs []string `json:"user_ids" binding:"required"`
}

// RolePermission 角色权限
type RolePermission struct {
	RoleID        string `json:"role_id"`
	MenuID        string `json:"menu_id"`
	PermissionKey string `json:"permission_key"`
	Resource      string `json:"resource"`
	Action        string `json:"action"`
}

// RoleRepository 角色数据访问接口
type RoleRepository interface {
	// 基础CRUD操作
	Create(ctx context.Context, role *Role) error
	GetByID(ctx context.Context, id string) (*Role, error)
	GetByCode(ctx context.Context, code string, tenantID string) (*Role, error)
	Update(ctx context.Context, role *Role) error
	Delete(ctx context.Context, id string) error

	// 查询操作
	GetByTenant(ctx context.Context, tenantID string) ([]*Role, error)
	GetActiveRoles(ctx context.Context, tenantID string) ([]*Role, error)
	GetSystemRoles(ctx context.Context) ([]*Role, error)

	// 用户角色关联
	GetRolesByUserID(ctx context.Context, userID string, tenantID string) ([]*Role, error)
	GetUsersByRoleID(ctx context.Context, roleID string) ([]*User, error)
	AssignRoleToUser(ctx context.Context, roleID, userID string) error
	RemoveRoleFromUser(ctx context.Context, roleID, userID string) error
	RemoveAllRolesFromUser(ctx context.Context, userID string) error

	// 菜单角色关联
	AssignMenusToRole(ctx context.Context, roleID string, menuIDs []string) error
	RemoveMenusFromRole(ctx context.Context, roleID string, menuIDs []string) error
	GetMenusByRole(ctx context.Context, roleID string) ([]*Menu, error)
}

// RoleUsecase 角色业务逻辑接口
type RoleUsecase interface {
	// 角色管理
	CreateRole(ctx context.Context, req *CreateRoleRequest) (*Role, error)
	GetRoleByID(ctx context.Context, id string) (*Role, error)
	GetRolesByTenant(ctx context.Context, tenantID string) ([]*Role, error)
	UpdateRole(ctx context.Context, id string, req *UpdateRoleRequest) (*Role, error)
	DeleteRole(ctx context.Context, id string) error

	// 用户角色管理
	AssignRoleToUsers(ctx context.Context, roleID string, req *AssignRoleRequest) error
	RemoveRoleFromUsers(ctx context.Context, roleID string, userIDs []string) error
	GetUsersByRole(ctx context.Context, roleID string) ([]*User, error)
	GetRolesByUser(ctx context.Context, userID, tenantID string) ([]*Role, error)

	// 权限管理
	AssignMenusToRole(ctx context.Context, roleID string, menuIDs []string) error
	GetRolePermissions(ctx context.Context, roleID string) ([]*RolePermission, error)

	// 系统角色初始化
	InitializeSystemRoles(ctx context.Context) error
	EnsureSystemRolesExist(ctx context.Context) error
}
