package route

import (
	"time"

	"pkms/api/controller"
	"pkms/bootstrap"
	"pkms/ent"
	"pkms/internal/casbin"

	"github.com/gin-gonic/gin"
)

func NewStaticMenuRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, casbinManager *casbin.CasbinManager, group *gin.RouterGroup) {
	staticMenuController := controller.NewStaticMenuController(casbinManager)

	// 获取系统固定菜单
	group.GET("/system", staticMenuController.GetSystemMenus)

	// 获取用户可访问的菜单
	group.GET("/user-menus", staticMenuController.GetUserMenus)

	// 获取管理员菜单
	group.GET("/admin-menus", staticMenuController.GetAdminMenus)

	// 获取所有菜单
	group.GET("/all-menus", staticMenuController.GetAllMenus)

	// 检查菜单访问权限
	group.GET("/check-access", staticMenuController.CheckMenuAccess)
}
