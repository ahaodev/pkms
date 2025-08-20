package controller

import (
	"net/http"
	"pkms/domain"
	"pkms/internal/casbin"

	"github.com/gin-gonic/gin"
)

type StaticMenuController struct {
	casbinManager *casbin.CasbinManager
}

func NewStaticMenuController(casbinManager *casbin.CasbinManager) *StaticMenuController {
	return &StaticMenuController{
		casbinManager: casbinManager,
	}
}

// GetSystemMenus 获取系统固定菜单
// @Summary      获取系统固定菜单
// @Description  获取系统预定义的固定菜单列表
// @Tags         菜单管理
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.Response{data=[]domain.MenuItem}  "获取成功"
// @Failure      500  {object}  domain.Response  "服务器错误"
// @Router       /static-menu/system [get]
func (smc *StaticMenuController) GetSystemMenus(c *gin.Context) {
	c.JSON(http.StatusOK, domain.RespSuccess(domain.SystemMenus))
}

// GetUserMenus 获取用户可访问的菜单
// @Summary      获取用户菜单
// @Description  根据用户权限获取可访问的菜单列表
// @Tags         菜单管理
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.Response{data=[]domain.MenuItem}  "获取成功"
// @Failure      401  {object}  domain.Response  "未授权"
// @Failure      500  {object}  domain.Response  "服务器错误"
// @Router       /static-menu/user-menus [get]
func (smc *StaticMenuController) GetUserMenus(c *gin.Context) {
	// 获取当前用户信息
	userID, exists := c.Get("x-user-id")
	if !exists {
		c.JSON(http.StatusUnauthorized, domain.RespError("未找到用户信息"))
		return
	}

	tenantID, exists := c.Get("x-tenant-id")
	if !exists {
		// 如果没有租户ID，返回基础菜单（允许访问基本功能）
		c.JSON(http.StatusOK, domain.RespSuccess(domain.BaseMenus))
		return
	}

	// 获取用户的菜单权限
	userMenus := make([]domain.MenuItem, 0)

	// 检查每个基础菜单的权限
	for _, menu := range domain.BaseMenus {
		hasPermission, err := smc.casbinManager.CheckPermission(userID.(string), tenantID.(string), menu.ID, "read")
		if err != nil {
			c.JSON(http.StatusInternalServerError, domain.RespError("权限检查失败"))
			return
		}
		if hasPermission {
			userMenus = append(userMenus, menu)
		}
	}

	c.JSON(http.StatusOK, domain.RespSuccess(userMenus))
}

// GetAdminMenus 获取管理员菜单
// @Summary      获取管理员菜单
// @Description  获取管理员专用的菜单列表
// @Tags         菜单管理
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.Response{data=[]domain.MenuItem}  "获取成功"
// @Failure      401  {object}  domain.Response  "未授权"
// @Failure      403  {object}  domain.Response  "权限不足"
// @Failure      500  {object}  domain.Response  "服务器错误"
// @Router       /static-menu/admin-menus [get]
func (smc *StaticMenuController) GetAdminMenus(c *gin.Context) {
	// 获取当前用户信息
	userID, exists := c.Get("x-user-id")
	if !exists {
		c.JSON(http.StatusUnauthorized, domain.RespError("未找到用户信息"))
		return
	}

	tenantID, exists := c.Get("x-tenant-id")
	if !exists {
		c.JSON(http.StatusUnauthorized, domain.RespError("未找到租户信息"))
		return
	}

	// 检查管理员权限
	isAdmin, err := smc.casbinManager.CheckPermission(userID.(string), tenantID.(string), "system", "admin")
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("权限检查失败"))
		return
	}
	if !isAdmin {
		c.JSON(http.StatusForbidden, domain.RespError("权限不足"))
		return
	}

	// 返回管理员菜单
	c.JSON(http.StatusOK, domain.RespSuccess(domain.AdminMenus))
}

// GetAllMenus 获取所有菜单
// @Summary      获取所有菜单
// @Description  获取系统中所有可用的菜单（管理员专用）
// @Tags         菜单管理
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.Response{data=[]domain.MenuItem}  "获取成功"
// @Failure      401  {object}  domain.Response  "未授权"
// @Failure      403  {object}  domain.Response  "权限不足"
// @Failure      500  {object}  domain.Response  "服务器错误"
// @Router       /static-menu/all-menus [get]
func (smc *StaticMenuController) GetAllMenus(c *gin.Context) {
	// 获取当前用户信息
	userID, exists := c.Get("x-user-id")
	if !exists {
		c.JSON(http.StatusUnauthorized, domain.RespError("未找到用户信息"))
		return
	}

	tenantID, exists := c.Get("x-tenant-id")
	if !exists {
		c.JSON(http.StatusUnauthorized, domain.RespError("未找到租户信息"))
		return
	}

	// 检查管理员权限
	isAdmin, err := smc.casbinManager.CheckPermission(userID.(string), tenantID.(string), "system", "admin")
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("权限检查失败"))
		return
	}
	if !isAdmin {
		c.JSON(http.StatusForbidden, domain.RespError("权限不足"))
		return
	}

	// 合并所有菜单
	allMenus := make([]domain.MenuItem, 0)
	allMenus = append(allMenus, domain.BaseMenus...)
	allMenus = append(allMenus, domain.AdminMenus...)

	c.JSON(http.StatusOK, domain.RespSuccess(allMenus))
}

// CheckMenuAccess 检查菜单访问权限
// @Summary      检查菜单访问权限
// @Description  检查用户是否有特定菜单的访问权限
// @Tags         菜单管理
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        path  query  string  true  "菜单路径"
// @Success      200  {object}  domain.Response{data=bool}  "检查成功"
// @Failure      400  {object}  domain.Response  "参数错误"
// @Failure      401  {object}  domain.Response  "未授权"
// @Failure      500  {object}  domain.Response  "服务器错误"
// @Router       /static-menu/check-access [get]
func (smc *StaticMenuController) CheckMenuAccess(c *gin.Context) {
	path := c.Query("path")
	if path == "" {
		c.JSON(http.StatusBadRequest, domain.RespError("菜单路径不能为空"))
		return
	}

	// 获取当前用户信息
	userID, exists := c.Get("x-user-id")
	if !exists {
		c.JSON(http.StatusUnauthorized, domain.RespError("未找到用户信息"))
		return
	}

	tenantID, exists := c.Get("x-tenant-id")
	if !exists {
		c.JSON(http.StatusUnauthorized, domain.RespError("未找到租户信息"))
		return
	}

	// 查找对应的菜单
	var menuID string
	allMenus := append(domain.BaseMenus, domain.AdminMenus...)
	for _, menu := range allMenus {
		if menu.Path == path {
			menuID = menu.ID
			break
		}
	}

	if menuID == "" {
		c.JSON(http.StatusOK, domain.RespSuccess(false))
		return
	}

	// 检查权限
	hasAccess, err := smc.casbinManager.CheckPermission(userID.(string), tenantID.(string), menuID, "read")
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError("权限检查失败"))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(hasAccess))
}
