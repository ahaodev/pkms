package casbin

// DEMO阶段简化版权限系统 - 大胆删除复杂配置！

// 简化的角色定义（只保留3个核心角色）
const (
	RoleAdmin  = "admin"  // 系统管理员：用户、租户管理
	RoleOwner  = "owner"  // 业务管理员：项目、包管理
	RoleViewer = "viewer" // 普通用户：查看权限
)

// 侧边栏权限（保持原有，但简化检查逻辑）
const (
	SidebarDashboard = "dashboard"
	SidebarProjects  = "projects"
	SidebarUpgrade   = "upgrade"
	ClientAccess     = "access-manager"
	ShareManager     = "shares"
	SidebarSystems   = "systems"
)

var ADMIN_SIDEBAR = []string{SidebarDashboard, SidebarProjects, ShareManager, SidebarUpgrade, ClientAccess, SidebarSystems}

// var ADMIN_SIDEBAR = []string{SidebarDashboard, SidebarProjects, ShareManager, SidebarUpgrade, ClientAccess}

var OWNER_SIDEBAR = []string{SidebarDashboard, SidebarProjects, SidebarUpgrade, ClientAccess, ShareManager}
var USER_SIDEBAR = []string{SidebarDashboard, SidebarProjects, SidebarUpgrade, ClientAccess, ShareManager}
var VIEWER_SIDEBAR = []string{SidebarDashboard, SidebarProjects}
var DEFAULT_SIDEBAR = []string{}
