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

var SidebarItems = [...]string{Dashboard, Projects, Packages, Tenants, Users, Groups, Permissions, Settings, Upgrade}

var Actions = [...]string{"read", "write"}
