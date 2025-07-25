package domain

// DEMO阶段极简角色定义 - 大刀阔斧！
const (
	RoleAdmin   = "admin"   // 系统管理员：全权限
	RoleManager = "manager" // 业务管理员：项目包管理
	RoleViewer  = "viewer"  // 普通用户：只读权限
)

// 租户内角色定义
const (
	TenantRoleAdmin   = "admin"   // 租户管理员：该租户内全权限
	TenantRoleManager = "manager" // 租户业务管理员：项目包管理权限
	TenantRoleViewer  = "viewer"  // 租户普通用户：只读权限
)
