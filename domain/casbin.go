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

// PolicyDetail 权限策略详情
type PolicyDetail struct {
	Subject     string `json:"subject"`
	SubjectName string `json:"subject_name,omitempty"`
	Domain      string `json:"domain"`
	DomainName  string `json:"domain_name,omitempty"`
	Object      string `json:"object"`
	Action      string `json:"action"`
}

// RoleDetail 角色详情
type RoleDetail struct {
	User       string `json:"user"`
	UserName   string `json:"user_name,omitempty"`
	Role       string `json:"role"`
	Domain     string `json:"domain"`
	DomainName string `json:"domain_name,omitempty"`
}

// EnhancedPoliciesResponse 增强版策略响应
type EnhancedPoliciesResponse struct {
	Policies []PolicyDetail `json:"policies"`
}

// EnhancedRolesResponse 增强版角色响应
type EnhancedRolesResponse struct {
	Roles []RoleDetail `json:"roles"`
}
