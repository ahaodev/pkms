package casbin

// DEMO阶段简化版权限系统 - 大胆删除复杂配置！

// 简化的角色定义（只保留3个核心角色）
const (
	RoleAdmin  = "admin"  // 系统管理员：用户、租户管理
	RoleOwner  = "owner"  // 业务管理员：项目、包管理
	RoleViewer = "viewer" // 普通用户：查看权限
)

// 侧边栏权限（简化版本，删除菜单管理）
const (
	SidebarDashboard   = "dashboard"       // 对应 "/"
	SidebarProjects    = "hierarchy"       // 对应 "/hierarchy"
	SidebarUpgrade     = "upgrade"         // 对应 "/upgrade"
	ClientAccess       = "access-manager"  // 对应 "/access-manager"
	ShareManager       = "shares"          // 对应 "/shares"
	SidebarTenants     = "tenants"         // 对应 "/tenants"
	SidebarUsers       = "users"           // 对应 "/users"
	SidebarPermissions = "permissions"     // 对应 "/permissions"
	SidebarRoles       = "role-management" // 对应 "/role-management"
)

var ADMIN_SIDEBAR = []string{
	SidebarDashboard, SidebarProjects, SidebarUpgrade, ClientAccess, ShareManager,
	SidebarTenants, SidebarUsers, SidebarPermissions, SidebarRoles,
}

var OWNER_SIDEBAR = []string{SidebarDashboard, SidebarProjects, SidebarUpgrade, ClientAccess, ShareManager}
var USER_SIDEBAR = []string{SidebarDashboard, SidebarProjects, SidebarUpgrade, ClientAccess, ShareManager}
var VIEWER_SIDEBAR = []string{SidebarDashboard, SidebarProjects}
var DEFAULT_SIDEBAR = []string{}
