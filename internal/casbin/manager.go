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

// AddDefaultRolesForUser 为用户添加默认角色
func (m *CasbinManager) AddDefaultRolesForUser(userID, role string) error {
	added, err := m.enforcer.AddRoleForUser(userID, role)
	if err != nil {
		return fmt.Errorf("failed to add role %s for user %s: %v", role, userID, err)
	}
	if added {
		log.Printf("为用户 %s 添加角色 %s", userID, role)
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

// AddPolicyForRole 为角色添加权限策略
func (m *CasbinManager) AddPolicyForRole(role, object, action string) (bool, error) {
	return m.enforcer.AddPolicy(role, object, action)
}

// RemovePolicyForRole 移除角色权限策略
func (m *CasbinManager) RemovePolicyForRole(role, object, action string) (bool, error) {
	return m.enforcer.RemovePolicy(role, object, action)
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
