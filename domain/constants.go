package domain

// 角色定义
const (
	RoleAdmin  = "admin"  // 系统管理员：全权限
	RoleOwner  = "owner"  // 所有者
	RoleUser   = "owner"  // 所有者
	RoleViewer = "viewer" // 普通用户：只读权限
)

// 租户内角色定义
const (
	TenantRoleOwner  = "owner"  // 租户业务管理员：项目包管理权限
	TenantRoleUser   = "user"   // 租户普通用户：读写权限
	TenantRoleViewer = "viewer" // 租户只读用户：只读权限
)
