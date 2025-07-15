package casbin

import (
	"fmt"
	"github.com/casbin/casbin/v2"
	_ "github.com/mattn/go-sqlite3"
	"log"
	"pkms/ent"
	"sync"
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
func (m *CasbinManager) CheckPermission(userID, domain, object, action string) (bool, error) {
	return m.enforcer.Enforce(userID, domain, object, action)
}

// AddPolicy 添加权限策略
func (m *CasbinManager) AddPolicy(userID, domain, object, action string) (bool, error) {
	return m.enforcer.AddPolicy(userID, domain, object, action)
}

// RemovePolicy 移除权限策略
func (m *CasbinManager) RemovePolicy(userID, domain, object, action string) (bool, error) {
	return m.enforcer.RemovePolicy(userID, domain, object, action)
}

// AddRoleForUser 为用户添加角色
func (m *CasbinManager) AddRoleForUser(userID, role, domain string) (bool, error) {
	return m.enforcer.AddRoleForUserInDomain(userID, role, domain)
}

// DeleteRoleForUser 删除用户角色
func (m *CasbinManager) DeleteRoleForUser(userID, role, domain string) (bool, error) {
	return m.enforcer.DeleteRoleForUserInDomain(userID, role, domain)
}

// GetRolesForUser 获取用户角色
func (m *CasbinManager) GetRolesForUser(userID, domain string) []string {
	return m.enforcer.GetRolesForUserInDomain(userID, domain)
}

// GetUsersForRole 获取角色下的用户
func (m *CasbinManager) GetUsersForRole(role, domain string) []string {
	return m.enforcer.GetUsersForRoleInDomain(role, domain)
}

// GetPermissionsForUser 获取用户权限 - 使用自定义实现
func (m *CasbinManager) GetPermissionsForUser(userID, domain string) [][]string {
	// 获取用户的所有策略
	policies, _ := m.enforcer.GetFilteredPolicy(0, userID, domain)

	// 获取用户角色的策略
	roles := m.enforcer.GetRolesForUserInDomain(userID, domain)
	for _, role := range roles {
		rolePolicies, _ := m.enforcer.GetFilteredPolicy(0, role, domain)
		policies = append(policies, rolePolicies...)
	}

	return policies
}

// InitializeDefaultPolicies 初始化默认权限策略
func (m *CasbinManager) InitializeDefaultPolicies() error {
	log.Println("正在初始化默认权限策略...")

	// 定义默认角色和权限
	defaultPolicies := [][]string{
		// 管理员角色权限
		{"admin", "*", "*", "*"},

		// 项目管理员权限
		{"pm", "*", "project", "*"},
		{"pm", "*", "package", "*"},
		{"pm", "*", "file", "*"},
		{"pm", "*", "user", "view"},
		{"pm", "*", "group", "*"},
		{"pm", "*", "permission", "*"},

		// 开发者权限
		{"dev", "*", "project", "view"},
		{"dev", "*", "package", "view"},
		{"dev", "*", "package", "create"},
		{"dev", "*", "package", "edit"},
		{"dev", "*", "file", "view"},
		{"dev", "*", "file", "create"},
		{"dev", "*", "file", "edit"},

		// 查看者权限
		{"viewer", "*", "project", "view"},
		{"viewer", "*", "package", "view"},
		{"viewer", "*", "file", "view"},
	}

	// 添加策略
	for _, policy := range defaultPolicies {
		added, err := m.enforcer.AddPolicy(policy)
		if err != nil {
			return fmt.Errorf("failed to add policy %v: %v", policy, err)
		}
		if added {
			log.Printf("添加策略: %v", policy)
		}
	}

	// 保存策略
	if err := m.enforcer.SavePolicy(); err != nil {
		return fmt.Errorf("failed to save policies: %v", err)
	}

	log.Println("默认权限策略初始化完成")
	return nil
}

// AddDefaultRolesForUser 为用户添加默认角色
func (m *CasbinManager) AddDefaultRolesForUser(userID, role string) error {
	// 为所有域添加角色
	domains := []string{"*", "default"}

	for _, domain := range domains {
		added, err := m.enforcer.AddRoleForUserInDomain(userID, role, domain)
		if err != nil {
			return fmt.Errorf("failed to add role %s for user %s in domain %s: %v", role, userID, domain, err)
		}
		if added {
			log.Printf("为用户 %s 在域 %s 添加角色 %s", userID, domain, role)
		}
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
