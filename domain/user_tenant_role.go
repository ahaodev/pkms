package domain

import (
	"context"
	"time"
)

// UserTenantRole 用户租户角色关联实体
type UserTenantRole struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	TenantID  string    `json:"tenant_id"`
	RoleCode  string    `json:"role_code"` // 使用角色代码而不是ID
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	// 关联信息
	UserName   string `json:"user_name,omitempty"`
	TenantName string `json:"tenant_name,omitempty"`
	RoleName   string `json:"role_name,omitempty"`
}

// AssignUserTenantRoleRequest 分配用户租户角色请求
type AssignUserTenantRoleRequest struct {
	UserID      string                 `json:"user_id" binding:"required"`
	TenantRoles []TenantRoleAssignment `json:"tenant_roles" binding:"required"`
}

// RemoveUserTenantRoleRequest 移除用户租户角色请求
type RemoveUserTenantRoleRequest struct {
	UserID   string `json:"user_id" binding:"required"`
	TenantID string `json:"tenant_id" binding:"required"`
	RoleCode string `json:"role_code" binding:"required"`
}

// UserTenantRoleRepository 用户租户角色数据访问接口
type UserTenantRoleRepository interface {
	// 基础CRUD操作
	Create(ctx context.Context, userTenantRole *UserTenantRole) error
	GetByID(ctx context.Context, id string) (*UserTenantRole, error)
	Delete(ctx context.Context, id string) error

	// 查询操作
	GetByUserTenantRole(ctx context.Context, userID, tenantID, roleCode string) (*UserTenantRole, error)
	GetRoleCodesByUserTenant(ctx context.Context, userID, tenantID string) ([]string, error)
	GetUsersByTenantRole(ctx context.Context, tenantID, roleCode string) ([]*User, error)
	GetTenantsByUserRole(ctx context.Context, userID, roleCode string) ([]*Tenant, error)
	GetAllUserTenantRoles(ctx context.Context, userID string) ([]*UserTenantRole, error)

	// 批量操作
	AssignRolesToUserInTenant(ctx context.Context, userID, tenantID string, roleCodes []string) error
	RemoveRolesFromUserInTenant(ctx context.Context, userID, tenantID string, roleCodes []string) error
	RemoveAllRolesFromUser(ctx context.Context, userID string) error
	RemoveAllRolesFromUserInTenant(ctx context.Context, userID, tenantID string) error
}

// UserTenantRoleUsecase 用户租户角色业务逻辑接口
type UserTenantRoleUsecase interface {
	// 角色分配管理
	AssignUserTenantRoles(ctx context.Context, req *AssignUserTenantRoleRequest) error
	RemoveUserTenantRole(ctx context.Context, req *RemoveUserTenantRoleRequest) error
	RemoveAllUserRolesInTenant(ctx context.Context, userID, tenantID string) error

	// 查询操作
	GetUserRolesByTenant(ctx context.Context, userID, tenantID string) ([]string, error)
	GetUsersByTenantRole(ctx context.Context, tenantID, roleCode string) ([]*User, error)
	GetAllUserTenantRoles(ctx context.Context, userID string) ([]*UserTenantRole, error)

	// 权限检查
	HasUserRoleInTenant(ctx context.Context, userID, tenantID, roleCode string) (bool, error)
	CheckUserPermissionInTenant(ctx context.Context, userID, tenantID, resource, action string) (bool, error)
}
