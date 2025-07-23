package casbin

const Sidebar = "sidebar"

// "dashboard", "projects", "packages", "users", "groups", "permissions", "settings", "upgrade"
const Dashboard = "dashboard"
const Projects = "projects"
const Packages = "packages"
const Tenants = "tenants"
const Users = "users"
const Groups = "groups"
const Permissions = "permissions"
const Settings = "settings"
const Upgrade = "upgrade"

var SidebarItems = [...]string{Dashboard, Projects, Upgrade, Tenants, Users, Groups, Permissions, Settings}

var Actions = [...]string{"read", "write", "delete"}

// 资源类型常量
const (
	ResourceProject = "project"
	ResourcePackage = "package"
	ResourceRelease = "release"
	ResourceUser    = "user"
	ResourceFile    = "file"
)

// 操作常量
const (
	ActionRead     = "read"
	ActionWrite    = "write"
	ActionDelete   = "delete"
	ActionCreate   = "create"
	ActionUpdate   = "update"
	ActionList     = "list"
	ActionShare    = "share"
	ActionUpload   = "upload"
	ActionDownload = "download"
)

// 默认角色权限配置
type RolePermissions struct {
	Resources map[string][]string // resource -> actions
	Sidebar   []string            // allowed sidebar items
}

// GetDefaultRolePermissions 获取默认角色权限配置
func GetDefaultRolePermissions() map[string]RolePermissions {
	return map[string]RolePermissions{
		"admin": {
			Resources: map[string][]string{
				ResourceProject: {ActionRead, ActionWrite, ActionDelete, ActionCreate, ActionUpdate, ActionList, ActionShare},
				ResourcePackage: {ActionRead, ActionWrite, ActionDelete, ActionCreate, ActionUpdate, ActionList, ActionShare},
				ResourceRelease: {ActionRead, ActionWrite, ActionDelete, ActionCreate, ActionUpdate, ActionList},
				ResourceUser:    {ActionRead, ActionWrite, ActionDelete, ActionCreate, ActionUpdate, ActionList},
				ResourceFile:    {ActionRead, ActionWrite, ActionDelete, ActionUpload, ActionDownload, ActionShare},
			},
			Sidebar: []string{Dashboard, Projects, Upgrade, Tenants, Users, Groups, Permissions, Settings},
		},
		"pm": {
			Resources: map[string][]string{
				ResourceProject: {ActionRead, ActionWrite, ActionDelete, ActionCreate, ActionUpdate, ActionList, ActionShare},
				ResourcePackage: {ActionRead, ActionWrite, ActionDelete, ActionCreate, ActionUpdate, ActionList, ActionShare},
				ResourceRelease: {ActionRead, ActionWrite, ActionDelete, ActionCreate, ActionUpdate, ActionList},
				ResourceFile:    {ActionRead, ActionWrite, ActionUpload, ActionDownload, ActionShare},
			},
			Sidebar: []string{Dashboard, Projects, Upgrade},
		},
		"user": {
			Resources: map[string][]string{
				ResourceProject: {ActionRead, ActionList},
				ResourcePackage: {ActionRead, ActionList},
				ResourceRelease: {ActionRead, ActionList},
				ResourceFile:    {ActionRead, ActionDownload},
			},
			Sidebar: []string{Dashboard, Projects},
		},
	}
}
