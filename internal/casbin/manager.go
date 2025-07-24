package casbin

import (
	"fmt"
	"log"
	"pkms/ent"
	"sync"

	"github.com/casbin/casbin/v2"
	_ "github.com/mattn/go-sqlite3"
)

var (
	enforcer *casbin.Enforcer
	once     sync.Once
)

// CasbinManager 权限管理器
type CasbinManager struct {
	enforcer *casbin.Enforcer
}

func NewCasbinManager(entClient *ent.Client) *CasbinManager {
	var err error

	once.Do(func() {
		// 初始化 ent 适配器
		adapter, adapterErr := NewAdapterWithClient(entClient)
		if adapterErr != nil {
			err = fmt.Errorf("failed to initialize casbin ent adapter: %v", adapterErr)
			return
		}

		// 创建 enforcer
		enforcer, err = casbin.NewEnforcer("config/rbac_model.conf", adapter)
		if err != nil {
			err = fmt.Errorf("failed to create casbin enforcer: %v", err)
			return
		}

		enforcer.EnableLog(true)
		enforcer.EnableAutoSave(true)

		// 加载策略
		err = enforcer.LoadPolicy()
		if err != nil {
			err = fmt.Errorf("failed to load casbin policy: %v", err)
			return
		}
	})

	if err != nil {
		panic(err)
	}

	return &CasbinManager{enforcer: enforcer}
}

// GetEnforcer 获取 enforcer 实例
func (m *CasbinManager) GetEnforcer() *casbin.Enforcer {
	return m.enforcer
}

// CheckPermission 检查权限
func (m *CasbinManager) CheckPermission(userID, tenantID, object, action string) (bool, error) {
	return m.enforcer.Enforce(userID, tenantID, object, action)
}

// AddPolicy 添加权限策略
func (m *CasbinManager) AddPolicy(userID, tenantID, object, action string) (bool, error) {
	return m.enforcer.AddPolicy(userID, tenantID, object, action)
}

// RemovePolicy 移除权限策略
func (m *CasbinManager) RemovePolicy(userID, tenantID, object, action string) (bool, error) {
	return m.enforcer.RemovePolicy(userID, tenantID, object, action)
}

// AddRoleForUser 为用户添加角色
func (m *CasbinManager) AddRoleForUser(userID, role, tenantID string) (bool, error) {
	return m.enforcer.AddRoleForUser(userID, role, tenantID)
}

// DeleteRoleForUser 删除用户角色
func (m *CasbinManager) DeleteRoleForUser(userID, role, tenantID string) (bool, error) {
	return m.enforcer.DeleteRoleForUser(userID, role, tenantID)
}

// GetRolesForUser 获取用户角色
func (m *CasbinManager) GetRolesForUser(userID, tenantID string) []string {
	roles, _ := m.enforcer.GetRolesForUser(userID, tenantID)
	return roles
}

// GetUsersForRole 获取角色下的用户
func (m *CasbinManager) GetUsersForRole(role, tenantID string) []string {
	users, _ := m.enforcer.GetUsersForRole(role, tenantID)
	return users
}

// GetPermissionsForUser 获取用户权限
func (m *CasbinManager) GetPermissionsForUser(userID, tenantID string) [][]string {
	permissions, _ := m.enforcer.GetPermissionsForUser(userID, tenantID)
	return permissions
}

// GetPermissionsForRole 获取角色权限
func (m *CasbinManager) GetPermissionsForRole(role, tenantID string) [][]string {
	permissions, _ := m.enforcer.GetPermissionsForUser(role, tenantID)
	return permissions
}

// AddDefaultRolesForUser 为用户添加默认角色 (支持多租户)
func (m *CasbinManager) AddDefaultRolesForUser(userID, role, tenantID string) error {
	added, err := m.enforcer.AddRoleForUser(userID, role, tenantID)
	if err != nil {
		return fmt.Errorf("failed to add role %s for user %s in tenant %s: %v", role, userID, tenantID, err)
	}
	if added {
		log.Printf("为用户 %s 在租户 %s 中添加角色 %s", userID, tenantID, role)
	}

	return m.enforcer.SavePolicy()
}

// GetAllPolicies 获取所有策略
func (m *CasbinManager) GetAllPolicies() [][]string {
	policies, _ := m.enforcer.GetPolicy()
	return policies
}

// GetAllRoles 获取所有角色映射
func (m *CasbinManager) GetAllRoles() [][]string {
	roles, _ := m.enforcer.GetGroupingPolicy()
	return roles
}

// SavePolicy 保存策略到数据库
func (m *CasbinManager) SavePolicy() error {
	return m.enforcer.SavePolicy()
}

// LoadPolicy 从数据库加载策略
func (m *CasbinManager) LoadPolicy() error {
	return m.enforcer.LoadPolicy()
}

// GetAllRoleNames 获取所有角色名称
func (m *CasbinManager) GetAllRoleNames() []string {
	allRoles := m.GetAllRoles()
	roleMap := make(map[string]bool)
	var roles []string

	for _, role := range allRoles {
		if len(role) >= 2 {
			roleName := role[1]
			if !roleMap[roleName] {
				roleMap[roleName] = true
				roles = append(roles, roleName)
			}
		}
	}

	return roles
}

// GetAllObjects 获取所有对象名称
func (m *CasbinManager) GetAllObjects() []string {
	allPolicies := m.GetAllPolicies()
	objectMap := make(map[string]bool)
	var objects []string

	for _, policy := range allPolicies {
		if len(policy) >= 2 {
			objectName := policy[1]
			if !objectMap[objectName] {
				objectMap[objectName] = true
				objects = append(objects, objectName)
			}
		}
	}

	return objects
}

// GetAllActions 获取所有操作名称
func (m *CasbinManager) GetAllActions() []string {
	allPolicies := m.GetAllPolicies()
	actionMap := make(map[string]bool)
	var actions []string

	for _, policy := range allPolicies {
		if len(policy) >= 3 {
			actionName := policy[2]
			if !actionMap[actionName] {
				actionMap[actionName] = true
				actions = append(actions, actionName)
			}
		}
	}

	return actions
}

// AddPolicyForRole 为角色添加权限策略 (支持多租户)
func (m *CasbinManager) AddPolicyForRole(role, tenantID, object, action string) (bool, error) {
	return m.enforcer.AddPolicy(role, tenantID, object, action)
}

// RemovePolicyForRole 移除角色权限策略 (支持多租户)
func (m *CasbinManager) RemovePolicyForRole(role, tenantID, object, action string) (bool, error) {
	return m.enforcer.RemovePolicy(role, tenantID, object, action)
}

// ClearAllPolicies 清空所有策略
func (m *CasbinManager) ClearAllPolicies() error {
	m.enforcer.ClearPolicy()
	return m.enforcer.SavePolicy()
}

// ClearAllRoles 清空所有角色
func (m *CasbinManager) ClearAllRoles() error {
	allRoles := m.GetAllRoles()
	for _, role := range allRoles {
		if len(role) >= 2 {
			m.enforcer.DeleteRoleForUser(role[0], role[1])
		}
	}
	return m.enforcer.SavePolicy()
}

// GetProjectPermissions 获取项目相关权限
func (m *CasbinManager) GetProjectPermissions(userID, tenantID, projectID string) []string {
	var permissions []string

	// 检查具体的项目权限
	for _, action := range Actions {
		if hasPermission, _ := m.CheckPermission(userID, tenantID, projectID, action); hasPermission {
			permissions = append(permissions, action)
		}
	}

	return permissions
}

// GetPackagePermissions 获取包相关权限
func (m *CasbinManager) GetPackagePermissions(userID, tenantID, packageID string) []string {
	var permissions []string
	// 检查具体的包权限
	for _, action := range Actions {
		if hasPermission, _ := m.CheckPermission(userID, tenantID, packageID, action); hasPermission {
			permissions = append(permissions, action)
		}
	}

	return permissions
}

// GetSidebarPermissions 获取侧边栏权限
func (m *CasbinManager) GetSidebarPermissions(userID, tenantID string) []string {
	var permissions []string
	// 检查侧边栏
	for _, item := range SidebarItems {
		if hasPermission, _ := m.CheckPermission(userID, tenantID, Sidebar, item); hasPermission {
			permissions = append(permissions, item)
		}
	}

	return permissions
}

// InitializeDefaultRolePermissions 初始化默认角色权限
// 注意：此函数不再使用，角色权限应该在租户上下文中创建
func (m *CasbinManager) InitializeDefaultRolePermissions() error {
	log.Printf("警告：InitializeDefaultRolePermissions 已弃用，请使用 InitializeRolePermissionsForTenant")
	// 不再创建使用通配符域的角色权限，避免多租户隔离问题
	return nil
}

// InitializeRolePermissionsForTenant 为特定租户初始化角色权限
func (m *CasbinManager) InitializeRolePermissionsForTenant(tenantID string) error {
	if tenantID == "" {
		return fmt.Errorf("租户ID不能为空")
	}

	rolePermissions := GetDefaultRolePermissions()

	for role, permissions := range rolePermissions {
		log.Printf("为租户 %s 初始化角色 %s 的权限", tenantID, role)

		// 添加资源权限 - 使用具体的租户ID而不是通配符
		for resource, actions := range permissions.Resources {
			for _, action := range actions {
				_, err := m.enforcer.AddPolicy(role, tenantID, resource, action)
				if err != nil {
					log.Printf("为租户 %s 添加角色 %s 的资源权限失败: %v", tenantID, role, err)
					return err
				}
			}
		}

		// 添加侧边栏权限 - 使用具体的租户ID
		for _, sidebarItem := range permissions.Sidebar {
			_, err := m.enforcer.AddPolicy(role, tenantID, Sidebar, sidebarItem)
			if err != nil {
				log.Printf("为租户 %s 添加角色 %s 的侧边栏权限失败: %v", tenantID, role, err)
				return err
			}
		}
	}

	return m.enforcer.SavePolicy()
}

// InitializeSystemAdminPermissions 初始化系统管理员权限（可跨租户）
func (m *CasbinManager) InitializeSystemAdminPermissions() error {
	adminPermissions := GetDefaultRolePermissions()["admin"]

	log.Printf("初始化系统管理员权限")

	// 只有系统管理员可以使用通配符域
	for resource, actions := range adminPermissions.Resources {
		for _, action := range actions {
			_, err := m.enforcer.AddPolicy("admin", "*", resource, action)
			if err != nil {
				log.Printf("添加系统管理员资源权限失败: %v", err)
				return err
			}
		}
	}

	// 添加侧边栏权限
	for _, sidebarItem := range adminPermissions.Sidebar {
		_, err := m.enforcer.AddPolicy("admin", "*", Sidebar, sidebarItem)
		if err != nil {
			log.Printf("添加系统管理员侧边栏权限失败: %v", err)
			return err
		}
	}

	return m.enforcer.SavePolicy()
}

// CleanupInvalidRolePermissions 清理使用通配符域的角色权限
func (m *CasbinManager) CleanupInvalidRolePermissions() error {
	log.Printf("开始清理无效的角色权限（使用通配符域的角色权限）")

	// 获取所有策略
	allPolicies := m.GetAllPolicies()
	var invalidPolicies [][]string

	for _, policy := range allPolicies {
		if len(policy) >= 4 {
			subject := policy[0]
			domain := policy[1]

			// 查找使用通配符域的角色权限（非用户权限）
			// 角色名通常是 admin, pm, user，不是长ID格式
			if domain == "*" && (subject == "admin" || subject == "pm" || subject == "user") {
				invalidPolicies = append(invalidPolicies, policy)
			}
		}
	}

	log.Printf("发现 %d 个无效的角色权限策略", len(invalidPolicies))

	// 删除无效的策略
	for _, policy := range invalidPolicies {
		if len(policy) >= 4 {
			removed, err := m.enforcer.RemovePolicy(policy[0], policy[1], policy[2], policy[3])
			if err != nil {
				log.Printf("删除无效策略失败: %v", err)
				return err
			}
			if removed {
				log.Printf("已删除无效策略: %s, %s, %s, %s", policy[0], policy[1], policy[2], policy[3])
			}
		}
	}

	return m.enforcer.SavePolicy()
}

// InitializeExistingTenantsRolePermissions 为现有租户初始化角色权限
func (m *CasbinManager) InitializeExistingTenantsRolePermissions(tenantIDs []string) error {
	log.Printf("为 %d 个现有租户初始化角色权限", len(tenantIDs))

	for _, tenantID := range tenantIDs {
		if tenantID == "" {
			continue
		}

		log.Printf("为租户 %s 初始化角色权限", tenantID)
		err := m.InitializeRolePermissionsForTenant(tenantID)
		if err != nil {
			log.Printf("为租户 %s 初始化角色权限失败: %v", tenantID, err)
			return err
		}
	}

	log.Printf("所有现有租户的角色权限初始化完成")
	return nil
}

// AddDefaultPermissionsForUser 为用户添加默认权限（基于角色）
func (m *CasbinManager) AddDefaultPermissionsForUser(userID, role, tenantID string) error {
	// 首先为用户分配角色
	_, err := m.enforcer.AddRoleForUser(userID, role, tenantID)
	if err != nil {
		return fmt.Errorf("添加用户角色失败: %v", err)
	}

	rolePermissions := GetDefaultRolePermissions()
	defaultPerms, exists := rolePermissions[role]
	if !exists {
		return fmt.Errorf("未找到角色 %s 的默认权限配置", role)
	}

	// 为用户在特定租户下添加权限
	for resource, actions := range defaultPerms.Resources {
		for _, action := range actions {
			_, err := m.enforcer.AddPolicy(userID, tenantID, resource, action)
			if err != nil {
				log.Printf("添加用户 %s 在租户 %s 的权限失败: %v", userID, tenantID, err)
			}
		}
	}

	// 添加侧边栏权限
	for _, sidebarItem := range defaultPerms.Sidebar {
		_, err := m.enforcer.AddPolicy(userID, tenantID, Sidebar, sidebarItem)
		if err != nil {
			log.Printf("添加用户 %s 在租户 %s 的侧边栏权限失败: %v", userID, tenantID, err)
		}
	}

	return m.enforcer.SavePolicy()
}
