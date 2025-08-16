package controller

import (
	"net/http"
	"pkms/bootstrap"
	"pkms/domain"
	"pkms/internal/constants"

	"github.com/gin-gonic/gin"
)

type MenuController struct {
	MenuUsecase domain.MenuUsecase
	Env         *bootstrap.Env
}

// GetMenuTree godoc
// @Summary      Get menu tree
// @Description  Retrieve the complete menu tree for the current tenant
// @Tags         Menus
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id  header    string  true  "Tenant ID"
// @Success      200  {object}  domain.Response{data=[]domain.MenuTreeNode}  "Menu tree retrieved successfully"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /menu/tree [get]
func (mc *MenuController) GetMenuTree(c *gin.Context) {
	tenantID := c.GetHeader(constants.TenantID)

	menuTree, err := mc.MenuUsecase.GetMenuTree(c, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(menuTree))
}

// GetUserMenuTree godoc
// @Summary      Get user menu tree
// @Description  Retrieve menu tree based on user permissions
// @Tags         Menus
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id  header    string  true  "Tenant ID"
// @Success      200  {object}  domain.Response{data=[]domain.MenuTreeNode}  "User menu tree retrieved successfully"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /menu/user-tree [get]
func (mc *MenuController) GetUserMenuTree(c *gin.Context) {
	userID := c.GetString(constants.UserID)
	tenantID := c.GetHeader(constants.TenantID)

	menuTree, err := mc.MenuUsecase.GetUserMenuTree(c, userID, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(menuTree))
}

// CreateMenu godoc
// @Summary      Create a new menu
// @Description  Create a new menu item (admin only)
// @Tags         Menus
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id  header    string  true  "Tenant ID"
// @Param        request      body      domain.CreateMenuRequest  true  "Menu creation data"
// @Success      201  {object}  domain.Response{data=domain.Menu}  "Menu created successfully"
// @Failure      400  {object}  domain.Response  "Invalid request data"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /menu [post]
func (mc *MenuController) CreateMenu(c *gin.Context) {
	var request domain.CreateMenuRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	// 设置租户ID
	if request.TenantID == "" {
		request.TenantID = c.GetHeader(constants.TenantID)
	}

	menu, err := mc.MenuUsecase.CreateMenu(c, &request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusCreated, domain.RespSuccess(menu))
}

// GetMenu godoc
// @Summary      Get menu by ID
// @Description  Retrieve a specific menu by its ID
// @Tags         Menus
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Menu ID"
// @Success      200  {object}  domain.Response{data=domain.Menu}  "Menu retrieved successfully"
// @Failure      404  {object}  domain.Response  "Menu not found"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /menu/{id} [get]
func (mc *MenuController) GetMenu(c *gin.Context) {
	id := c.Param("id")

	menu, err := mc.MenuUsecase.GetMenuByID(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("Menu not found"))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(menu))
}

// UpdateMenu godoc
// @Summary      Update menu
// @Description  Update an existing menu (admin only)
// @Tags         Menus
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      string                    true  "Menu ID"
// @Param        request  body      domain.UpdateMenuRequest  true  "Menu update data"
// @Success      200      {object}  domain.Response{data=domain.Menu}  "Menu updated successfully"
// @Failure      400      {object}  domain.Response  "Invalid request data"
// @Failure      404      {object}  domain.Response  "Menu not found"
// @Failure      500      {object}  domain.Response  "Internal server error"
// @Router       /menu/{id} [put]
func (mc *MenuController) UpdateMenu(c *gin.Context) {
	id := c.Param("id")

	var request domain.UpdateMenuRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	menu, err := mc.MenuUsecase.UpdateMenu(c, id, &request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(menu))
}

// DeleteMenu godoc
// @Summary      Delete menu
// @Description  Delete a menu and its actions (admin only)
// @Tags         Menus
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Menu ID"
// @Success      200  {object}  domain.Response  "Menu deleted successfully"
// @Failure      400  {object}  domain.Response  "Cannot delete menu"
// @Failure      404  {object}  domain.Response  "Menu not found"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /menu/{id} [delete]
func (mc *MenuController) DeleteMenu(c *gin.Context) {
	id := c.Param("id")

	err := mc.MenuUsecase.DeleteMenu(c, id)
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Menu deleted successfully"))
}

// GetMenuActions godoc
// @Summary      Get menu actions
// @Description  Retrieve all actions for a specific menu
// @Tags         Menus
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Menu ID"
// @Success      200  {object}  domain.Response{data=[]domain.MenuAction}  "Menu actions retrieved successfully"
// @Failure      404  {object}  domain.Response  "Menu not found"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /menu/{id}/actions [get]
func (mc *MenuController) GetMenuActions(c *gin.Context) {
	menuID := c.Param("id")

	actions, err := mc.MenuUsecase.GetMenuActions(c, menuID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(actions))
}

// CreateMenuAction godoc
// @Summary      Create menu action
// @Description  Create a new action for a menu (admin only)
// @Tags         Menus
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      string                         true  "Menu ID"
// @Param        request  body      domain.CreateMenuActionRequest  true  "Menu action creation data"
// @Success      201      {object}  domain.Response{data=domain.MenuAction}  "Menu action created successfully"
// @Failure      400      {object}  domain.Response  "Invalid request data"
// @Failure      500      {object}  domain.Response  "Internal server error"
// @Router       /menu/{id}/actions [post]
func (mc *MenuController) CreateMenuAction(c *gin.Context) {
	menuID := c.Param("id")

	var request domain.CreateMenuActionRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	action, err := mc.MenuUsecase.CreateMenuAction(c, menuID, &request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusCreated, domain.RespSuccess(action))
}

// UpdateMenuAction godoc
// @Summary      Update menu action
// @Description  Update an existing menu action (admin only)
// @Tags         Menus
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        actionId  path      string                         true  "Action ID"
// @Param        request   body      domain.CreateMenuActionRequest  true  "Menu action update data"
// @Success      200       {object}  domain.Response{data=domain.MenuAction}  "Menu action updated successfully"
// @Failure      400       {object}  domain.Response  "Invalid request data"
// @Failure      404       {object}  domain.Response  "Menu action not found"
// @Failure      500       {object}  domain.Response  "Internal server error"
// @Router       /menu/actions/{actionId} [put]
func (mc *MenuController) UpdateMenuAction(c *gin.Context) {
	actionID := c.Param("actionId")

	var request domain.CreateMenuActionRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	action, err := mc.MenuUsecase.UpdateMenuAction(c, actionID, &request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(action))
}

// DeleteMenuAction godoc
// @Summary      Delete menu action
// @Description  Delete a menu action (admin only)
// @Tags         Menus
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        actionId  path      string  true  "Action ID"
// @Success      200       {object}  domain.Response  "Menu action deleted successfully"
// @Failure      400       {object}  domain.Response  "Cannot delete action"
// @Failure      404       {object}  domain.Response  "Menu action not found"
// @Failure      500       {object}  domain.Response  "Internal server error"
// @Router       /menu/actions/{actionId} [delete]
func (mc *MenuController) DeleteMenuAction(c *gin.Context) {
	actionID := c.Param("actionId")

	err := mc.MenuUsecase.DeleteMenuAction(c, actionID)
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("Menu action deleted successfully"))
}

// CheckPermission godoc
// @Summary      Check user permission
// @Description  Check if current user has specific permission
// @Tags         Menus
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id     header    string  true   "Tenant ID"
// @Param        permission_key  query     string  true   "Permission key to check"
// @Success      200             {object}  domain.Response{data=bool}  "Permission check result"
// @Failure      400             {object}  domain.Response  "Invalid request"
// @Failure      500             {object}  domain.Response  "Internal server error"
// @Router       /menu/check-permission [get]
func (mc *MenuController) CheckPermission(c *gin.Context) {
	userID := c.GetString(constants.UserID)
	tenantID := c.GetHeader(constants.TenantID)
	permissionKey := c.Query("permission_key")

	if permissionKey == "" {
		c.JSON(http.StatusBadRequest, domain.RespError("permission_key is required"))
		return
	}

	hasPermission, err := mc.MenuUsecase.CheckActionPermission(c, userID, tenantID, permissionKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(hasPermission))
}

// GetUserPermissions godoc
// @Summary      Get user permissions
// @Description  Get all permissions for the current user
// @Tags         Menus
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id  header    string  true  "Tenant ID"
// @Success      200  {object}  domain.Response{data=[]string}  "User permissions retrieved successfully"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /menu/user-permissions [get]
func (mc *MenuController) GetUserPermissions(c *gin.Context) {
	userID := c.GetString(constants.UserID)
	tenantID := c.GetHeader(constants.TenantID)

	permissions, err := mc.MenuUsecase.GetUserPermissions(c, userID, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(permissions))
}
