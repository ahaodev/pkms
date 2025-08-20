package casbin

import (
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
func (m *CasbinManager) CheckPermission(user, tenant, object, action string) (bool, error) {
	return m.enforcer.Enforce(user, tenant, object, action)
}

// AddPolicy 添加权限策略
func (m *CasbinManager) AddPolicy(subject, tenant, object, action string) (bool, error) {
	return m.enforcer.AddPolicy(subject, tenant, object, action)
}

// RemovePolicy 移除权限策略
func (m *CasbinManager) RemovePolicy(subject, tenant, object, action string) (bool, error) {
	return m.enforcer.RemovePolicy(subject, tenant, object, action)
}

// AddRoleForUser 为用户添加角色
func (m *CasbinManager) AddRoleForUser(user, role, tenant string) (bool, error) {
	return m.enforcer.AddRoleForUser(user, role, tenant)
}

// DeleteRoleForUser 删除用户角色
func (m *CasbinManager) DeleteRoleForUser(user, role, tenant string) (bool, error) {
	return m.enforcer.DeleteRoleForUser(user, role, tenant)
}

// GetRolesForUser 获取用户角色
func (m *CasbinManager) GetRolesForUser(user, tenant string) []string {
	roles, err := m.enforcer.GetRolesForUser(user, tenant)
	if err != nil {
		log.Printf("获取用户角色失败: %v", err)
		return []string{}
	}
	return roles
}

// GetUsersForRole 获取角色下的用户
func (m *CasbinManager) GetUsersForRole(role, tenant string) []string {
	users, err := m.enforcer.GetUsersForRole(role, tenant)
	if err != nil {
		log.Printf("获取角色用户失败: %v", err)
		return []string{}
	}
	return users
}

// GetPermissionsForUser 获取用户权限
func (m *CasbinManager) GetPermissionsForUser(user, tenant string) [][]string {
	permissions, err := m.enforcer.GetPermissionsForUser(user, tenant)
	if err != nil {
		log.Printf("获取用户权限失败: %v", err)
		return [][]string{}
	}
	return permissions
}

// GetPermissionsForRole 获取角色权限
func (m *CasbinManager) GetPermissionsForRole(role, tenant string) [][]string {
	// 使用GetImplicitPermissionsForUser获取角色的隐式权限
	permissions, err := m.enforcer.GetImplicitPermissionsForUser(role, tenant)
	if err != nil {
		log.Printf("获取角色权限失败: %v", err)
		return [][]string{}
	}
	return permissions
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

// extractUniqueValues 提取唯一值的通用函数
func extractUniqueValues(data [][]string, index int) []string {
	valueMap := make(map[string]bool)
	var values []string

	for _, row := range data {
		if len(row) > index {
			value := row[index]
			if !valueMap[value] {
				valueMap[value] = true
				values = append(values, value)
			}
		}
	}

	return values
}

// GetAllRoleNames 获取所有角色名称
func (m *CasbinManager) GetAllRoleNames() []string {
	allRoles := m.GetAllRoles()
	return extractUniqueValues(allRoles, 1)
}

// GetAllObjects 获取所有对象名称
func (m *CasbinManager) GetAllObjects() []string {
	allPolicies := m.GetAllPolicies()
	return extractUniqueValues(allPolicies, 1)
}

// GetAllActions 获取所有操作名称
func (m *CasbinManager) GetAllActions() []string {
	allPolicies := m.GetAllPolicies()
	return extractUniqueValues(allPolicies, 2)
}

// GetSidebarPermissions 直接基于角色返回权限
func (m *CasbinManager) GetSidebarPermissions(user, tenant string) []string {
	// 获取用户角色
	userRoles := m.GetRolesForUser(user, tenant)
	// 基于角色返回权限
	for _, role := range userRoles {
		switch role {
		case domain.SystemRoleAdmin:
			return ADMIN_SIDEBAR
		case domain.TenantRoleOwner:
			return OWNER_SIDEBAR
		case domain.TenantRoleUser:
			return USER_SIDEBAR
		case domain.TenantRoleViewer:
			return USER_SIDEBAR
		}
	}
	return DEFAULT_SIDEBAR
}

// AddRoleForUserInTenant 为用户在指定租户中添加角色
func (m *CasbinManager) AddRoleForUserInTenant(user, role, tenant string) error {
	log.Printf("为用户 %s 在租户 %s 中添加角色 %s", user, tenant, role)
	// 使用域模式：sub, role, domain
	_, err := m.enforcer.AddRoleForUserInDomain(user, role, tenant)
	if err != nil {
		return fmt.Errorf("添加租户角色失败: %v", err)
	}
	return m.enforcer.SavePolicy()
}

// DeleteRoleForUserInTenant 移除用户在指定租户中的角色
func (m *CasbinManager) DeleteRoleForUserInTenant(user, role, tenant string) error {
	log.Printf("移除用户 %s 在租户 %s 中的角色 %s", user, tenant, role)
	_, err := m.enforcer.DeleteRoleForUserInDomain(user, role, tenant)
	if err != nil {
		return fmt.Errorf("移除租户角色失败: %v", err)
	}
	return m.enforcer.SavePolicy()
}

// GetRolesForUserInTenant 获取用户在指定租户中的所有角色
func (m *CasbinManager) GetRolesForUserInTenant(user, tenant string) []string {
	roles := m.enforcer.GetRolesForUserInDomain(user, tenant)
	log.Printf("获取用户 %s 在租户 %s 中的角色: %v", user, tenant, roles)
	return roles
}

// GetUsersForRoleInTenant 获取在指定租户中具有特定角色的所有用户
func (m *CasbinManager) GetUsersForRoleInTenant(role, tenant string) []string {
	users := m.enforcer.GetUsersForRoleInDomain(role, tenant)
	log.Printf("获取租户 %s 中具有角色 %s 的用户: %v", tenant, role, users)
	return users
}

// HasRoleInTenant 检查用户在指定租户中是否具有特定角色
func (m *CasbinManager) HasRoleInTenant(user, role, tenant string) bool {
	// 检查域级别的角色 - 通过GetRolesForUserInDomain检查
	roles := m.enforcer.GetRolesForUserInDomain(user, tenant)
	for _, r := range roles {
		if r == role {
			log.Printf("用户 %s 在租户 %s 中具有角色 %s", user, tenant, role)
			return true
		}
	}
	log.Printf("用户 %s 在租户 %s 中不具有角色 %s", user, tenant, role)
	return false
}

// DeleteAllRolesForUserInTenant 移除用户在指定租户中的所有角色
func (m *CasbinManager) DeleteAllRolesForUserInTenant(user, tenant string) error {
	log.Printf("移除用户 %s 在租户 %s 中的所有角色", user, tenant)
	_, err := m.enforcer.DeleteRolesForUserInDomain(user, tenant)
	if err != nil {
		return fmt.Errorf("移除租户中所有角色失败: %v", err)
	}
	return m.enforcer.SavePolicy()
}
