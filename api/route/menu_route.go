package route

import (
	"pkms/api/controller"
	"pkms/bootstrap"
	"pkms/ent"
	"pkms/repository"
	"pkms/usecase"
	"time"

	"github.com/gin-gonic/gin"
	"pkms/internal/casbin"
)

func NewMenuRouter(
	env *bootstrap.Env,
	timeout time.Duration,
	db *ent.Client,
	casbinManager *casbin.CasbinManager,
	group *gin.RouterGroup,
) {
	// 初始化 repositories
	menuRepository := repository.NewMenuRepository(db)
	menuActionRepository := repository.NewMenuActionRepository(db)
	roleRepository := repository.NewRoleRepository(db)

	// 初始化 usecase
	menuUsecase := usecase.NewMenuUsecase(
		menuRepository,
		menuActionRepository,
		roleRepository,
		casbinManager,
		timeout,
	)

	// 初始化 controller
	menuController := &controller.MenuController{
		MenuUsecase: menuUsecase,
		Env:         env,
	}

	// 菜单路由
	group.GET("/tree", menuController.GetMenuTree)          // 获取完整菜单树
	group.GET("/user-tree", menuController.GetUserMenuTree) // 获取用户菜单树
	group.POST("", menuController.CreateMenu)               // 创建菜单
	group.GET("/:id", menuController.GetMenu)               // 获取菜单详情
	group.PUT("/:id", menuController.UpdateMenu)            // 更新菜单
	group.DELETE("/:id", menuController.DeleteMenu)         // 删除菜单

	// 菜单动作路由
	group.GET("/:id/actions", menuController.GetMenuActions)            // 获取菜单动作
	group.POST("/:id/actions", menuController.CreateMenuAction)         // 创建菜单动作
	group.PUT("/actions/:actionId", menuController.UpdateMenuAction)    // 更新菜单动作
	group.DELETE("/actions/:actionId", menuController.DeleteMenuAction) // 删除菜单动作

	// 权限检查路由
	group.GET("/check-permission", menuController.CheckPermission)    // 检查权限
	group.GET("/user-permissions", menuController.GetUserPermissions) // 获取用户权限
}
