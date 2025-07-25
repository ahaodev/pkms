package casbin

// DEMO阶段简化版权限系统 - 大胆删除复杂配置！

// 简化的角色定义（只保留3个核心角色）
const (
	RoleAdmin   = "admin"   // 系统管理员：用户、租户管理
	RoleManager = "manager" // 业务管理员：项目、包管理
	RoleViewer  = "viewer"  // 普通用户：查看权限
)

// 侧边栏权限（保持原有，但简化检查逻辑）
const (
	SidebarDashboard   = "dashboard"
	SidebarProjects    = "projects"
	SidebarTenants     = "tenants"
	SidebarUsers       = "users"
	SidebarPermissions = "permissions"
	SidebarSettings    = "settings"
	SidebarUpgrade     = "upgrade"
)

// 简化的侧边栏访问权限
func GetSidebarPermissions(role string) []string {
	switch role {
	case RoleAdmin:
		return []string{SidebarDashboard, SidebarProjects, SidebarTenants, SidebarUsers, SidebarPermissions, SidebarSettings, SidebarUpgrade}
	case RoleManager:
		return []string{SidebarDashboard, SidebarProjects, SidebarUpgrade}
	case RoleViewer:
		return []string{SidebarDashboard, SidebarProjects}
	default:
		return []string{SidebarDashboard}
	}
}

// 简化的角色检查函数
func IsSystemAdmin(role string) bool {
	return role == RoleAdmin
}

func IsBusinessManager(role string) bool {
	return role == RoleAdmin || role == RoleManager
}

func IsValidRole(role string) bool {
	return role == RoleAdmin || role == RoleManager || role == RoleViewer
}
