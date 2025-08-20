package domain

import (
	"context"
	"time"
)

// TenantUserRequest 租户用户操作请求
type TenantUserRequest struct {
	UserID string `json:"user_id" binding:"required"`
	Role   string `json:"role" binding:"required"`
}

// UpdateTenantUserRoleRequest 更新租户用户角色请求
type UpdateTenantUserRoleRequest struct {
	Role     string `json:"role" binding:"required"`
	IsActive *bool  `json:"is_active,omitempty"`
}

// UserUpdateRequest 用户部分更新请求
type UserUpdateRequest struct {
	Name     *string `json:"name,omitempty"`
	Password *string `json:"password,omitempty"`
	IsActive *bool   `json:"is_active,omitempty"`
}

type Tenant struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TenantPagedResult 租户分页查询结果
type TenantPagedResult = PagedResult[*Tenant]

// TenantUser 租户用户关系
type TenantUser struct {
	ID        string    `json:"id"`
	TenantID  string    `json:"tenant_id"`
	UserID    string    `json:"user_id"`
	Role      string    `json:"role"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	CreatedBy string    `json:"created_by"`
	// 关联信息
	Username   string `json:"username,omitempty"`
	TenantName string `json:"tenant_name,omitempty"`
}

type TenantRepository interface {
	Create(c context.Context, tenant *Tenant) error
	Fetch(c context.Context) ([]*Tenant, error)
	FetchPaged(c context.Context, params QueryParams) (*TenantPagedResult, error)
	GetByID(c context.Context, id string) (*Tenant, error)
	Update(c context.Context, tenant *Tenant) error
	Delete(c context.Context, id string) error
	GetTenantsByUserID(c context.Context, userID string) ([]*Tenant, error)
	GetTenantUsers(c context.Context, tenantID string) ([]*User, error)
	AddUserToTenant(c context.Context, userID, tenantID string) error
	RemoveUserFromTenant(c context.Context, userID, tenantID string) error
	// 新增租户用户角色管理方法
	GetTenantUsersWithRole(c context.Context, tenantID string) ([]*TenantUser, error)
	AddUserToTenantWithRole(c context.Context, userID, tenantID, role, createdBy string) error
	UpdateTenantUserRole(c context.Context, userID, tenantID, role string, isActive *bool) error
	GetTenantUserRole(c context.Context, userID, tenantID string) (*TenantUser, error)
	GetUserTenants(c context.Context, userID string) ([]*TenantUser, error)
}

type TenantUseCase interface {
	Create(c context.Context, tenant *Tenant) error
	Fetch(c context.Context) ([]*Tenant, error)
	FetchPaged(c context.Context, params QueryParams) (*TenantPagedResult, error)
	GetByID(c context.Context, id string) (*Tenant, error)
	Update(c context.Context, tenant *Tenant) error
	Delete(c context.Context, id string) error
	GetTenantsByUserID(c context.Context, userID string) ([]*Tenant, error)
	GetTenantUsers(c context.Context, tenantID string) ([]*User, error)
	AddUserToTenant(c context.Context, userID, tenantID string) error
	RemoveUserFromTenant(c context.Context, userID, tenantID string) error
	// 新增租户用户角色管理方法
	GetTenantUsersWithRole(c context.Context, tenantID string) ([]*TenantUser, error)
	AddUserToTenantWithRole(c context.Context, userID, tenantID, role, createdBy string) error
	UpdateTenantUserRole(c context.Context, userID, tenantID, role string, isActive *bool) error
	GetTenantUserRole(c context.Context, userID, tenantID string) (*TenantUser, error)
	GetUserTenants(c context.Context, userID string) ([]*TenantUser, error)
}
