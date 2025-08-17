package domain

// 角色定义
const (
	SystemRoleAdmin  = "admin"  // 系统管理员：全权限
	TenantRoleOwner  = "owner"  // 租户业务管理员：项目包管理权限
	TenantRoleUser   = "user"   // 租户普通用户：读写权限
	TenantRoleViewer = "viewer" // 租户只读用户：只读权限
)

// 所有可用角色列表
var AllRoles = []string{
	SystemRoleAdmin,
	TenantRoleOwner,
	TenantRoleUser,
	TenantRoleViewer,
}

// 固定菜单定义
type MenuItem struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Path          string `json:"path"`
	Icon          string `json:"icon"`
	Component     string `json:"component"`
	Sort          int    `json:"sort"`
	Visible       bool   `json:"visible"`
	RequiresAuth  bool   `json:"requiresAuth"`
	RequiresAdmin bool   `json:"requiresAdmin"`
}

// 基础菜单（所有用户都可以根据权限访问）
var BaseMenus = []MenuItem{
	{
		ID:            "dashboard",
		Name:          "仪表板",
		Path:          "/",
		Icon:          "Home",
		Component:     "Dashboard",
		Sort:          1,
		Visible:       true,
		RequiresAuth:  true,
		RequiresAdmin: false,
	},
	{
		ID:            "hierarchy",
		Name:          "项目管理",
		Path:          "/hierarchy",
		Icon:          "FolderTree",
		Component:     "HierarchyPage",
		Sort:          2,
		Visible:       true,
		RequiresAuth:  true,
		RequiresAdmin: false,
	},
	{
		ID:            "upgrade",
		Name:          "升级",
		Path:          "/upgrade",
		Icon:          "Rocket",
		Component:     "UpgradePage",
		Sort:          3,
		Visible:       true,
		RequiresAuth:  true,
		RequiresAdmin: false,
	},
	{
		ID:            "access-manager",
		Name:          "访问管理",
		Path:          "/access-manager",
		Icon:          "ShieldCheck",
		Component:     "ClientAccessPage",
		Sort:          4,
		Visible:       true,
		RequiresAuth:  true,
		RequiresAdmin: false,
	},
	{
		ID:            "shares",
		Name:          "共享管理",
		Path:          "/shares",
		Icon:          "Share2",
		Component:     "SharesManagerPage",
		Sort:          5,
		Visible:       true,
		RequiresAuth:  true,
		RequiresAdmin: false,
	},
}

// 管理员专用菜单
var AdminMenus = []MenuItem{
	{
		ID:            "users",
		Name:          "用户管理",
		Path:          "/users",
		Icon:          "Users",
		Component:     "UsersPage",
		Sort:          6,
		Visible:       true,
		RequiresAuth:  true,
		RequiresAdmin: true,
	},
	{
		ID:            "tenants",
		Name:          "租户管理",
		Path:          "/tenants",
		Icon:          "Building2",
		Component:     "TenantsPage",
		Sort:          7,
		Visible:       true,
		RequiresAuth:  true,
		RequiresAdmin: true,
	},
	{
		ID:            "role-management",
		Name:          "角色管理",
		Path:          "/role-management",
		Icon:          "UserCheck",
		Component:     "RoleManagement",
		Sort:          8,
		Visible:       true,
		RequiresAuth:  true,
		RequiresAdmin: true,
	},
	{
		ID:            "user-tenant-role-management",
		Name:          "用户角色分配",
		Path:          "/user-tenant-role-management",
		Icon:          "Settings",
		Component:     "UserTenantRole",
		Sort:          9,
		Visible:       true,
		RequiresAuth:  true,
		RequiresAdmin: true,
	},
}

// 系统固定菜单（兼容性保留）
var SystemMenus = []MenuItem{
	{
		ID:            "admin",
		Name:          "管理员",
		Path:          "/admin",
		Icon:          "Settings",
		Component:     "AdminLayout",
		Sort:          1,
		Visible:       true,
		RequiresAuth:  true,
		RequiresAdmin: true,
	},
}
