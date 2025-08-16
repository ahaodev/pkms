package initializer

import (
	"context"
	"fmt"
	"log"
	"pkms/domain"
	"pkms/ent"
	"pkms/internal/casbin"
	"pkms/repository"
	"pkms/usecase"
	"time"
)

// RBACInitializer RBAC系统初始化器
type RBACInitializer struct {
	client        *ent.Client
	casbinManager *casbin.CasbinManager
	timeout       time.Duration
}

// NewRBACInitializer 创建RBAC初始化器
func NewRBACInitializer(client *ent.Client, casbinManager *casbin.CasbinManager) *RBACInitializer {
	return &RBACInitializer{
		client:        client,
		casbinManager: casbinManager,
		timeout:       2 * time.Minute,
	}
}

// Initialize 初始化RBAC系统
func (ri *RBACInitializer) Initialize() error {
	log.Println("开始初始化RBAC系统...")

	ctx, cancel := context.WithTimeout(context.Background(), ri.timeout)
	defer cancel()

	// 初始化系统角色
	if err := ri.initSystemRoles(ctx); err != nil {
		return fmt.Errorf("初始化系统角色失败: %w", err)
	}

	// 初始化系统菜单
	if err := ri.initSystemMenus(ctx); err != nil {
		return fmt.Errorf("初始化系统菜单失败: %w", err)
	}

	// 初始化角色菜单关联
	if err := ri.initRoleMenuAssociations(ctx); err != nil {
		return fmt.Errorf("初始化角色菜单关联失败: %w", err)
	}

	log.Println("RBAC系统初始化完成")
	return nil
}

// initSystemRoles 初始化系统角色
func (ri *RBACInitializer) initSystemRoles(ctx context.Context) error {
	log.Println("初始化系统角色...")

	roleRepo := repository.NewRoleRepository(ri.client)
	menuRepo := repository.NewMenuRepository(ri.client)
	userRepo := repository.NewUserRepository(ri.client)

	roleUsecase := usecase.NewRoleUsecase(
		roleRepo,
		menuRepo,
		userRepo,
		ri.casbinManager,
		ri.timeout,
	)

	// 确保系统角色存在
	if err := roleUsecase.EnsureSystemRolesExist(ctx); err != nil {
		return err
	}

	log.Println("系统角色初始化完成")
	return nil
}

// initSystemMenus 初始化系统菜单
func (ri *RBACInitializer) initSystemMenus(ctx context.Context) error {
	log.Println("初始化系统菜单...")

	menuRepo := repository.NewMenuRepository(ri.client)

	// 定义系统菜单结构
	systemMenus := []struct {
		Menu    *domain.Menu
		Actions []domain.MenuAction
	}{
		{
			Menu: &domain.Menu{
				Name:        "仪表板",
				Path:        "/",
				Icon:        "BarChart3",
				Component:   "Dashboard",
				Sort:        1,
				Visible:     true,
				IsSystem:    true,
				Description: "系统概览和统计信息",
			},
			Actions: []domain.MenuAction{
				{Name: "查看仪表板", Code: "read", Resource: "/api/v1/dashboard", Method: "GET", PermissionKey: "dashboard:read", IsSystem: true},
			},
		},
		{
			Menu: &domain.Menu{
				Name:        "项目管理",
				Path:        "/hierarchy",
				Icon:        "Boxes",
				Component:   "HierarchyPage",
				Sort:        2,
				Visible:     true,
				IsSystem:    true,
				Description: "管理项目和包",
			},
			Actions: []domain.MenuAction{
				{Name: "查看项目", Code: "read", Resource: "/api/v1/projects", Method: "GET", PermissionKey: "project:read", IsSystem: true},
				{Name: "创建项目", Code: "create", Resource: "/api/v1/projects", Method: "POST", PermissionKey: "project:create", IsSystem: true},
				{Name: "编辑项目", Code: "update", Resource: "/api/v1/projects/*", Method: "PUT", PermissionKey: "project:update", IsSystem: true},
				{Name: "删除项目", Code: "delete", Resource: "/api/v1/projects/*", Method: "DELETE", PermissionKey: "project:delete", IsSystem: true},
			},
		},
		{
			Menu: &domain.Menu{
				Name:        "升级管理",
				Path:        "/upgrade",
				Icon:        "Rocket",
				Component:   "UpgradePage",
				Sort:        3,
				Visible:     true,
				IsSystem:    true,
				Description: "管理系统升级",
			},
			Actions: []domain.MenuAction{
				{Name: "查看升级", Code: "read", Resource: "/api/v1/upgrades", Method: "GET", PermissionKey: "upgrade:read", IsSystem: true},
				{Name: "创建升级", Code: "create", Resource: "/api/v1/upgrades", Method: "POST", PermissionKey: "upgrade:create", IsSystem: true},
				{Name: "执行升级", Code: "execute", Resource: "/api/v1/upgrades/*/execute", Method: "POST", PermissionKey: "upgrade:execute", IsSystem: true},
			},
		},
		{
			Menu: &domain.Menu{
				Name:        "访问管理",
				Path:        "/access-manager",
				Icon:        "Shield",
				Component:   "ClientAccessPage",
				Sort:        4,
				Visible:     true,
				IsSystem:    true,
				Description: "管理客户端访问权限",
			},
			Actions: []domain.MenuAction{
				{Name: "查看访问", Code: "read", Resource: "/api/v1/access-manager", Method: "GET", PermissionKey: "access:read", IsSystem: true},
				{Name: "创建访问", Code: "create", Resource: "/api/v1/access-manager", Method: "POST", PermissionKey: "access:create", IsSystem: true},
				{Name: "编辑访问", Code: "update", Resource: "/api/v1/access-manager/*", Method: "PUT", PermissionKey: "access:update", IsSystem: true},
				{Name: "删除访问", Code: "delete", Resource: "/api/v1/access-manager/*", Method: "DELETE", PermissionKey: "access:delete", IsSystem: true},
			},
		},
		{
			Menu: &domain.Menu{
				Name:        "分享管理",
				Path:        "/shares",
				Icon:        "Share2",
				Component:   "SharesManagerPage",
				Sort:        5,
				Visible:     true,
				IsSystem:    true,
				Description: "管理文件分享",
			},
			Actions: []domain.MenuAction{
				{Name: "查看分享", Code: "read", Resource: "/api/v1/shares", Method: "GET", PermissionKey: "share:read", IsSystem: true},
				{Name: "创建分享", Code: "create", Resource: "/api/v1/shares", Method: "POST", PermissionKey: "share:create", IsSystem: true},
				{Name: "编辑分享", Code: "update", Resource: "/api/v1/shares/*", Method: "PUT", PermissionKey: "share:update", IsSystem: true},
				{Name: "删除分享", Code: "delete", Resource: "/api/v1/shares/*", Method: "DELETE", PermissionKey: "share:delete", IsSystem: true},
			},
		},
		{
			Menu: &domain.Menu{
				Name:        "系统管理",
				Path:        "",
				Icon:        "Settings",
				Component:   "",
				Sort:        100,
				Visible:     true,
				IsSystem:    true,
				Description: "系统管理功能",
			},
			Actions: []domain.MenuAction{},
		},
	}

	// 系统管理子菜单
	systemSubMenus := []struct {
		Menu       *domain.Menu
		ParentName string
		Actions    []domain.MenuAction
	}{
		{
			Menu: &domain.Menu{
				Name:        "租户管理",
				Path:        "/tenants",
				Icon:        "Globe",
				Component:   "TenantsPage",
				Sort:        1,
				Visible:     true,
				IsSystem:    true,
				Description: "管理系统租户",
			},
			ParentName: "系统管理",
			Actions: []domain.MenuAction{
				{Name: "查看租户", Code: "read", Resource: "/api/v1/tenants", Method: "GET", PermissionKey: "tenant:read", IsSystem: true},
				{Name: "创建租户", Code: "create", Resource: "/api/v1/tenants", Method: "POST", PermissionKey: "tenant:create", IsSystem: true},
				{Name: "编辑租户", Code: "update", Resource: "/api/v1/tenants/*", Method: "PUT", PermissionKey: "tenant:update", IsSystem: true},
				{Name: "删除租户", Code: "delete", Resource: "/api/v1/tenants/*", Method: "DELETE", PermissionKey: "tenant:delete", IsSystem: true},
			},
		},
		{
			Menu: &domain.Menu{
				Name:        "用户管理",
				Path:        "/users",
				Icon:        "Users",
				Component:   "UsersPage",
				Sort:        2,
				Visible:     true,
				IsSystem:    true,
				Description: "管理系统用户",
			},
			ParentName: "系统管理",
			Actions: []domain.MenuAction{
				{Name: "查看用户", Code: "read", Resource: "/api/v1/user", Method: "GET", PermissionKey: "user:read", IsSystem: true},
				{Name: "创建用户", Code: "create", Resource: "/api/v1/user", Method: "POST", PermissionKey: "user:create", IsSystem: true},
				{Name: "编辑用户", Code: "update", Resource: "/api/v1/user/*", Method: "PUT", PermissionKey: "user:update", IsSystem: true},
				{Name: "删除用户", Code: "delete", Resource: "/api/v1/user/*", Method: "DELETE", PermissionKey: "user:delete", IsSystem: true},
			},
		},
		{
			Menu: &domain.Menu{
				Name:        "菜单管理",
				Path:        "/menu-management",
				Icon:        "Menu",
				Component:   "MenuManagement",
				Sort:        4,
				Visible:     true,
				IsSystem:    true,
				Description: "管理系统菜单",
			},
			ParentName: "系统管理",
			Actions: []domain.MenuAction{
				{Name: "查看菜单", Code: "read", Resource: "/api/v1/menu", Method: "GET", PermissionKey: "menu:read", IsSystem: true},
				{Name: "创建菜单", Code: "create", Resource: "/api/v1/menu", Method: "POST", PermissionKey: "menu:create", IsSystem: true},
				{Name: "编辑菜单", Code: "update", Resource: "/api/v1/menu/*", Method: "PUT", PermissionKey: "menu:update", IsSystem: true},
				{Name: "删除菜单", Code: "delete", Resource: "/api/v1/menu/*", Method: "DELETE", PermissionKey: "menu:delete", IsSystem: true},
			},
		},
		{
			Menu: &domain.Menu{
				Name:        "角色管理",
				Path:        "/role-management",
				Icon:        "UserCheck",
				Component:   "RoleManagement",
				Sort:        5,
				Visible:     true,
				IsSystem:    true,
				Description: "管理系统角色",
			},
			ParentName: "系统管理",
			Actions: []domain.MenuAction{
				{Name: "查看角色", Code: "read", Resource: "/api/v1/role", Method: "GET", PermissionKey: "role:read", IsSystem: true},
				{Name: "创建角色", Code: "create", Resource: "/api/v1/role", Method: "POST", PermissionKey: "role:create", IsSystem: true},
				{Name: "编辑角色", Code: "update", Resource: "/api/v1/role/*", Method: "PUT", PermissionKey: "role:update", IsSystem: true},
				{Name: "删除角色", Code: "delete", Resource: "/api/v1/role/*", Method: "DELETE", PermissionKey: "role:delete", IsSystem: true},
				{Name: "分配角色", Code: "assign", Resource: "/api/v1/role/*/assign", Method: "POST", PermissionKey: "role:assign", IsSystem: true},
			},
		},
	}

	// 创建顶级菜单和动作
	menuMap := make(map[string]string) // 菜单名称到ID的映射
	for _, item := range systemMenus {
		// 检查菜单是否已存在
		existingMenu, err := menuRepo.GetByPath(ctx, item.Menu.Path, "")
		if err == nil && existingMenu != nil {
			menuMap[item.Menu.Name] = existingMenu.ID
			continue
		}

		// 创建菜单
		err = menuRepo.Create(ctx, item.Menu)
		if err != nil {
			return fmt.Errorf("创建菜单 %s 失败: %w", item.Menu.Name, err)
		}

		menuMap[item.Menu.Name] = item.Menu.ID

		// 创建菜单动作
		menuActionRepo := repository.NewMenuActionRepository(ri.client)
		for _, action := range item.Actions {
			action.MenuID = item.Menu.ID
			err = menuActionRepo.Create(ctx, &action)
			if err != nil {
				log.Printf("创建菜单动作失败: %v", err)
			}
		}
	}

	// 创建子菜单
	for _, item := range systemSubMenus {
		parentID, exists := menuMap[item.ParentName]
		if !exists {
			log.Printf("父菜单 %s 不存在，跳过创建子菜单 %s", item.ParentName, item.Menu.Name)
			continue
		}

		// 检查子菜单是否已存在
		existingMenu, err := menuRepo.GetByPath(ctx, item.Menu.Path, "")
		if err == nil && existingMenu != nil {
			continue
		}

		// 设置父菜单ID
		item.Menu.ParentID = &parentID

		// 创建子菜单
		err = menuRepo.Create(ctx, item.Menu)
		if err != nil {
			return fmt.Errorf("创建子菜单 %s 失败: %w", item.Menu.Name, err)
		}

		// 创建菜单动作
		menuActionRepo := repository.NewMenuActionRepository(ri.client)
		for _, action := range item.Actions {
			action.MenuID = item.Menu.ID
			err = menuActionRepo.Create(ctx, &action)
			if err != nil {
				log.Printf("创建菜单动作失败: %v", err)
			}
		}
	}

	log.Println("系统菜单初始化完成")
	return nil
}

// initRoleMenuAssociations 初始化角色菜单关联
func (ri *RBACInitializer) initRoleMenuAssociations(ctx context.Context) error {
	log.Println("初始化角色菜单关联...")

	roleRepo := repository.NewRoleRepository(ri.client)
	menuRepo := repository.NewMenuRepository(ri.client)

	// 获取所有系统角色
	roles, err := roleRepo.GetSystemRoles(ctx)
	if err != nil {
		return fmt.Errorf("获取系统角色失败: %w", err)
	}

	// 获取所有菜单
	allMenus, err := menuRepo.GetByTenant(ctx, "")
	if err != nil {
		return fmt.Errorf("获取菜单失败: %w", err)
	}

	// 为每个角色分配菜单
	for _, role := range roles {
		var menuIDs []string
		
		switch role.Code {
		case "admin":
			// 管理员拥有所有菜单权限
			for _, menu := range allMenus {
				menuIDs = append(menuIDs, menu.ID)
			}
		case "owner":
			// 租户管理员拥有除系统管理外的所有权限
			for _, menu := range allMenus {
				if menu.Name != "系统管理" && (menu.ParentID == nil || !isSystemManagementChild(menu, allMenus)) {
					menuIDs = append(menuIDs, menu.ID)
				}
			}
		case "user":
			// 普通用户拥有基本功能权限
			for _, menu := range allMenus {
				if isBasicMenu(menu.Name) {
					menuIDs = append(menuIDs, menu.ID)
				}
			}
		case "viewer":
			// 访客用户只有查看权限
			for _, menu := range allMenus {
				if isViewOnlyMenu(menu.Name) {
					menuIDs = append(menuIDs, menu.ID)
				}
			}
		}

		// 分配菜单给角色
		if len(menuIDs) > 0 {
			err = roleRepo.AssignMenusToRole(ctx, role.ID, menuIDs)
			if err != nil {
				log.Printf("为角色 %s 分配菜单失败: %v", role.Name, err)
			}
		}
	}

	log.Println("角色菜单关联初始化完成")
	return nil
}

// isSystemManagementChild 检查是否为系统管理的子菜单
func isSystemManagementChild(menu *domain.Menu, allMenus []*domain.Menu) bool {
	if menu.ParentID == nil {
		return false
	}
	
	for _, m := range allMenus {
		if m.ID == *menu.ParentID {
			return m.Name == "系统管理"
		}
	}
	return false
}

// isBasicMenu 检查是否为基本功能菜单
func isBasicMenu(menuName string) bool {
	basicMenus := []string{"仪表板", "项目管理", "升级管理", "访问管理", "分享管理"}
	for _, name := range basicMenus {
		if name == menuName {
			return true
		}
	}
	return false
}

// isViewOnlyMenu 检查是否为只读菜单
func isViewOnlyMenu(menuName string) bool {
	viewOnlyMenus := []string{"仪表板", "项目管理"}
	for _, name := range viewOnlyMenus {
		if name == menuName {
			return true
		}
	}
	return false
}