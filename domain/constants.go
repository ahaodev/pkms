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
		Name:          "Dashboard",
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
		Name:          "PPR",
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
		Name:          "Upgrade",
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
		Name:          "Access Management",
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
		Name:          "Shares",
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
		Name:          "Users",
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
		Name:          "Tenants",
		Path:          "/tenants",
		Icon:          "Building2",
		Component:     "TenantsPage",
		Sort:          7,
		Visible:       true,
		RequiresAuth:  true,
		RequiresAdmin: true,
	},
}

// 系统固定菜单（兼容性保留）
var SystemMenus = []MenuItem{
	{
		ID:            "admin",
		Name:          "System Management",
		Path:          "/admin",
		Icon:          "Settings",
		Component:     "AdminLayout",
		Sort:          1,
		Visible:       true,
		RequiresAuth:  true,
		RequiresAdmin: true,
	},
}
