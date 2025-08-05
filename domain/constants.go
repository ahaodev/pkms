package domain

// 角色定义
const (
	SystemRoleAdmin  = "admin"  // 系统管理员：全权限
	TenantRoleOwner  = "owner"  // 租户业务管理员：项目包管理权限
	TenantRoleUser   = "user"   // 租户普通用户：读写权限
	TenantRoleViewer = "viewer" // 租户只读用户：只读权限
)
