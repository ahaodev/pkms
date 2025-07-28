package casbin

import (
	"context"
	"fmt"
	"log"
	"pkms/domain"
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
	enforcer  *casbin.Enforcer
	entClient *ent.Client
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

	return &CasbinManager{enforcer: enforcer, entClient: entClient}
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
	// 检查是否是系统内置admin用户，如果是，在任何租户中都返回admin角色
	if m.IsSystemAdmin(userID) {
		return []string{domain.RoleAdmin}
	}

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

// GetSidebarPermissions 直接基于角色返回权限
func (m *CasbinManager) GetSidebarPermissions(userID, tenantID string) []string {
	// 系统admin全权限
	if m.IsSystemAdmin(userID) {
		return ADMIN_SIDEBAR
	}

	// 获取用户角色
	userRoles := m.GetRolesForUser(userID, tenantID)
	if len(userRoles) == 0 {
		return []string{"dashboard", "projects"} // 默认权限
	}

	// 基于角色返回权限
	for _, role := range userRoles {
		switch role {
		case domain.RoleAdmin:
			return ADMIN_SIDEBAR
		case domain.RoleOwner:
			return OWNER_SIDEBAR
		}
	}

	return DEFAULT_SIDEBAR
}

// DEMO版本：删除复杂的权限初始化函数

// InitializeRolePermissionsForTenant DEMO阶段简化版 - 只需要角色分配，不需要复杂权限
func (m *CasbinManager) InitializeRolePermissionsForTenant(tenantID string) error {
	if tenantID == "" {
		return fmt.Errorf("租户ID不能为空")
	}

	log.Printf("DEMO版本：为租户 %s 跳过复杂权限初始化，只依赖角色检查", tenantID)

	// DEMO阶段：不需要复杂的权限策略，只需要角色分配
	// 权限检查主要通过角色实现：admin、manager、viewer

	return nil
}

// 租户级别的角色管理方法

// AddRoleForUserInTenant 为用户在指定租户中添加角色
func (m *CasbinManager) AddRoleForUserInTenant(userID, role, tenantID string) error {
	log.Printf("为用户 %s 在租户 %s 中添加角色 %s", userID, tenantID, role)
	// 使用域模式：sub, role, domain
	_, err := m.enforcer.AddRoleForUserInDomain(userID, role, tenantID)
	if err != nil {
		return fmt.Errorf("添加租户角色失败: %v", err)
	}
	return m.enforcer.SavePolicy()
}

// DeleteRoleForUserInTenant 移除用户在指定租户中的角色
func (m *CasbinManager) DeleteRoleForUserInTenant(userID, role, tenantID string) error {
	log.Printf("移除用户 %s 在租户 %s 中的角色 %s", userID, tenantID, role)
	_, err := m.enforcer.DeleteRoleForUserInDomain(userID, role, tenantID)
	if err != nil {
		return fmt.Errorf("移除租户角色失败: %v", err)
	}
	return m.enforcer.SavePolicy()
}

// GetRolesForUserInTenant 获取用户在指定租户中的所有角色
func (m *CasbinManager) GetRolesForUserInTenant(userID, tenantID string) []string {
	roles := m.enforcer.GetRolesForUserInDomain(userID, tenantID)
	log.Printf("获取用户 %s 在租户 %s 中的角色: %v", userID, tenantID, roles)
	return roles
}

// GetUsersForRoleInTenant 获取在指定租户中具有特定角色的所有用户
func (m *CasbinManager) GetUsersForRoleInTenant(role, tenantID string) []string {
	users := m.enforcer.GetUsersForRoleInDomain(role, tenantID)
	log.Printf("获取租户 %s 中具有角色 %s 的用户: %v", tenantID, role, users)
	return users
}

// HasRoleInTenant 检查用户在指定租户中是否具有特定角色
func (m *CasbinManager) HasRoleInTenant(userID, role, tenantID string) bool {
	has, _ := m.enforcer.HasRoleForUser(userID, role)
	// 检查域级别的角色 - 通过GetRolesForUserInDomain检查
	roles := m.enforcer.GetRolesForUserInDomain(userID, tenantID)
	hasDomain := false
	for _, r := range roles {
		if r == role {
			hasDomain = true
			break
		}
	}
	log.Printf("检查用户 %s 在租户 %s 中是否具有角色 %s: global=%t, domain=%t", userID, tenantID, role, has, hasDomain)
	return hasDomain
}

// DeleteAllRolesForUserInTenant 移除用户在指定租户中的所有角色
func (m *CasbinManager) DeleteAllRolesForUserInTenant(userID, tenantID string) error {
	log.Printf("移除用户 %s 在租户 %s 中的所有角色", userID, tenantID)
	_, err := m.enforcer.DeleteRolesForUserInDomain(userID, tenantID)
	if err != nil {
		return fmt.Errorf("移除租户中所有角色失败: %v", err)
	}
	return m.enforcer.SavePolicy()
}

// InitializeSystemAdminPermissions 初始化系统管理员权限（可跨租户）
func (m *CasbinManager) InitializeSystemAdminPermissions() error {
	log.Printf("初始化系统管理员权限")

	// admin作为系统管理员，拥有所有资源的所有权限
	// 使用通配符简化策略：域名、资源、操作都使用通配符
	_, err := m.enforcer.AddPolicy("admin", "*", "*", "*")
	if err != nil {
		log.Printf("添加系统管理员全局权限失败: %v", err)
		return err
	}

	return m.enforcer.SavePolicy()
}

// AddDefaultPermissionsForUser DEMO版本：只分配角色，不需要复杂权限
func (m *CasbinManager) AddDefaultPermissionsForUser(userID, role, tenantID string) error {
	// DEMO阶段：只需要为用户分配角色即可
	_, err := m.enforcer.AddRoleForUser(userID, role, tenantID)
	if err != nil {
		return fmt.Errorf("添加用户角色失败: %v", err)
	}

	log.Printf("DEMO版本：为用户 %s 在租户 %s 分配角色 %s", userID, tenantID, role)

	return m.enforcer.SavePolicy()
}

// IsSystemAdmin 检查用户是否是系统内置的admin用户
func (m *CasbinManager) IsSystemAdmin(userID string) bool {
	if m.entClient == nil {
		return false
	}

	user, err := m.entClient.User.Get(context.Background(), userID)
	if err != nil {
		return false
	}

	return user.Username == RoleAdmin
}
