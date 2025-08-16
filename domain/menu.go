package domain

import (
	"context"
	"time"
)

// Menu 菜单实体
type Menu struct {
	ID          string        `json:"id"`
	Name        string        `json:"name"`
	Path        string        `json:"path,omitempty"`
	Icon        string        `json:"icon,omitempty"`
	Component   string        `json:"component,omitempty"`
	Sort        int           `json:"sort"`
	Visible     bool          `json:"visible"`
	IsSystem    bool          `json:"is_system"`
	TenantID    string        `json:"tenant_id,omitempty"`
	Description string        `json:"description,omitempty"`
	ParentID    *string       `json:"parent_id,omitempty"`
	Children    []*Menu       `json:"children,omitempty"`
	Actions     []*MenuAction `json:"actions,omitempty"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
}

// MenuAction 菜单动作权限
type MenuAction struct {
	ID            string    `json:"id"`
	MenuID        string    `json:"menu_id"`
	Name          string    `json:"name"`
	Code          string    `json:"code"`
	Resource      string    `json:"resource"`
	Method        string    `json:"method,omitempty"`
	PermissionKey string    `json:"permission_key"`
	Description   string    `json:"description,omitempty"`
	IsSystem      bool      `json:"is_system"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// CreateMenuRequest 创建菜单请求
type CreateMenuRequest struct {
	Name        string `json:"name" binding:"required"`
	Path        string `json:"path,omitempty"`
	Icon        string `json:"icon,omitempty"`
	Component   string `json:"component,omitempty"`
	Sort        int    `json:"sort"`
	Visible     bool   `json:"visible"`
	TenantID    string `json:"tenant_id,omitempty"`
	ParentID    string `json:"parent_id,omitempty"`
	Description string `json:"description,omitempty"`
}

// UpdateMenuRequest 更新菜单请求
type UpdateMenuRequest struct {
	Name        string `json:"name,omitempty"`
	Path        string `json:"path,omitempty"`
	Icon        string `json:"icon,omitempty"`
	Component   string `json:"component,omitempty"`
	Sort        *int   `json:"sort,omitempty"`
	Visible     *bool  `json:"visible,omitempty"`
	ParentID    string `json:"parent_id,omitempty"`
	Description string `json:"description,omitempty"`
}

// CreateMenuActionRequest 创建菜单动作请求
type CreateMenuActionRequest struct {
	Name          string `json:"name" binding:"required"`
	Code          string `json:"code" binding:"required"`
	Resource      string `json:"resource" binding:"required"`
	Method        string `json:"method,omitempty"`
	PermissionKey string `json:"permission_key" binding:"required"`
	Description   string `json:"description,omitempty"`
}

// MenuTreeNode 菜单树节点
type MenuTreeNode struct {
	*Menu
	Children []*MenuTreeNode `json:"children,omitempty"`
}

// MenuRepository 菜单数据访问接口
type MenuRepository interface {
	// 基础CRUD操作
	Create(ctx context.Context, menu *Menu) error
	GetByID(ctx context.Context, id string) (*Menu, error)
	Update(ctx context.Context, menu *Menu) error
	Delete(ctx context.Context, id string) error

	// 查询操作
	GetByTenant(ctx context.Context, tenantID string) ([]*Menu, error)
	GetRootMenus(ctx context.Context, tenantID string) ([]*Menu, error)
	GetChildrenByParentID(ctx context.Context, parentID string) ([]*Menu, error)
	GetMenuTree(ctx context.Context, tenantID string) ([]*MenuTreeNode, error)
	GetByPath(ctx context.Context, path string, tenantID string) (*Menu, error)

	// 权限相关
	GetMenusByRole(ctx context.Context, roleID string, tenantID string) ([]*Menu, error)
	GetVisibleMenus(ctx context.Context, tenantID string) ([]*Menu, error)
}

// MenuActionRepository 菜单动作数据访问接口
type MenuActionRepository interface {
	// 基础CRUD操作
	Create(ctx context.Context, action *MenuAction) error
	GetByID(ctx context.Context, id string) (*MenuAction, error)
	Update(ctx context.Context, action *MenuAction) error
	Delete(ctx context.Context, id string) error

	// 查询操作
	GetByMenuID(ctx context.Context, menuID string) ([]*MenuAction, error)
	GetByPermissionKey(ctx context.Context, permissionKey string) (*MenuAction, error)
	GetByResource(ctx context.Context, resource string, method string) ([]*MenuAction, error)

	// 批量操作
	CreateBatch(ctx context.Context, actions []*MenuAction) error
	DeleteByMenuID(ctx context.Context, menuID string) error
}

// MenuUsecase 菜单业务逻辑接口
type MenuUsecase interface {
	// 菜单管理
	CreateMenu(ctx context.Context, req *CreateMenuRequest) (*Menu, error)
	GetMenuByID(ctx context.Context, id string) (*Menu, error)
	UpdateMenu(ctx context.Context, id string, req *UpdateMenuRequest) (*Menu, error)
	DeleteMenu(ctx context.Context, id string) error

	// 菜单树操作
	GetMenuTree(ctx context.Context, tenantID string) ([]*MenuTreeNode, error)
	GetUserMenuTree(ctx context.Context, userID, tenantID string) ([]*MenuTreeNode, error)

	// 菜单动作管理
	CreateMenuAction(ctx context.Context, menuID string, req *CreateMenuActionRequest) (*MenuAction, error)
	GetMenuActions(ctx context.Context, menuID string) ([]*MenuAction, error)
	UpdateMenuAction(ctx context.Context, actionID string, req *CreateMenuActionRequest) (*MenuAction, error)
	DeleteMenuAction(ctx context.Context, actionID string) error

	// 权限检查
	CheckMenuPermission(ctx context.Context, userID, tenantID, menuID string) (bool, error)
	CheckActionPermission(ctx context.Context, userID, tenantID, permissionKey string) (bool, error)
	GetUserPermissions(ctx context.Context, userID, tenantID string) ([]string, error)
}
