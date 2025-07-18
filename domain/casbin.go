package domain

// AddPolicyRequest 添加策略请求
type AddPolicyRequest struct {
	UserID string `json:"user_id" binding:"required"`
	Tenant string `json:"tenant" binding:"required"`
	Object string `json:"object" binding:"required"`
	Action string `json:"action" binding:"required"`
}

// RemovePolicyRequest 移除策略请求
type RemovePolicyRequest struct {
	UserID string `json:"user_id" binding:"required"`
	Tenant string `json:"tenant" binding:"required"`
	Object string `json:"object" binding:"required"`
	Action string `json:"action" binding:"required"`
}

// AddRoleRequest 添加角色请求
type AddRoleRequest struct {
	UserID string `json:"user_id" binding:"required"`
	Tenant string `json:"tenant" binding:"required"`
	Role   string `json:"role" binding:"required"`
}

// RemoveRoleRequest 移除角色请求
type RemoveRoleRequest struct {
	UserID string `json:"user_id" binding:"required"`
	Tenant string `json:"tenant" binding:"required"`
	Role   string `json:"role" binding:"required"`
}

// CheckPermissionRequest 检查权限请求
type CheckPermissionRequest struct {
	UserID string `json:"user_id" binding:"required"`
	Tenant string `json:"tenant" binding:"required"`
	Object string `json:"object" binding:"required"`
	Action string `json:"action" binding:"required"`
}

// AddRolePolicyRequest 添加角色权限请求
type AddRolePolicyRequest struct {
	Role   string `json:"role" binding:"required"`
	Tenant string `json:"tenant" binding:"required"`
	Object string `json:"object" binding:"required"`
	Action string `json:"action" binding:"required"`
}

// RemoveRolePolicyRequest 移除角色权限请求
type RemoveRolePolicyRequest struct {
	Role   string `json:"role" binding:"required"`
	Tenant string `json:"tenant" binding:"required"`
	Object string `json:"object" binding:"required"`
	Action string `json:"action" binding:"required"`
}

// UserPermissionsResponse 用户权限响应
type UserPermissionsResponse struct {
	UserID      string     `json:"user_id"`
	Permissions [][]string `json:"permissions"`
	Roles       []string   `json:"roles"`
}

// RolePermissionsResponse 角色权限响应
type RolePermissionsResponse struct {
	Role        string     `json:"role"`
	Permissions [][]string `json:"permissions"`
}
