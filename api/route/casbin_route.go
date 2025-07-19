package route

import (
	"time"

	"pkms/api/controller"
	"pkms/bootstrap"
	"pkms/ent"
	"pkms/internal/casbin"

	"github.com/gin-gonic/gin"
)

// NewCasbinRouter 创建 Casbin 权限管理路由
func NewCasbinRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, casbinManager *casbin.CasbinManager, group *gin.RouterGroup) {
	// 创建控制器
	casbinController := controller.NewCasbinController(casbinManager)

	// 策略管理路由
	group.POST("/policies", casbinController.AddPolicy)
	group.DELETE("/policies", casbinController.RemovePolicy)
	group.GET("/policies", casbinController.GetAllPolicies)
	group.POST("/policies/check", casbinController.CheckPermission)
	group.DELETE("/policies/clear", casbinController.ClearAllPolicies)

	// 角色管理路由
	group.POST("/roles", casbinController.AddRole)
	group.DELETE("/roles", casbinController.RemoveRole)
	group.GET("/roles", casbinController.GetAllRoles)
	group.GET("/roles/names", casbinController.GetAllRoleNames)
	group.GET("/roles/:role/users", casbinController.GetRoleUsers)
	group.GET("/roles/:role/permissions", casbinController.GetRolePermissions)
	group.DELETE("/roles/clear", casbinController.ClearAllRoles)

	// 角色权限管理路由
	group.POST("/role-policies", casbinController.AddRolePolicy)
	group.DELETE("/role-policies", casbinController.RemoveRolePolicy)

	// 用户权限路由
	group.GET("/users/:user_id/permissions", casbinController.GetUserPermissions)
	group.GET("/users/:user_id/roles", casbinController.GetUserRoles)

	// 权限查询路由
	group.GET("/sidebar/permissions", casbinController.GetSidebarPermissions)
	group.GET("/project/permissions", casbinController.GetProjectPermissions)
	group.GET("/package/permissions", casbinController.GetPackagePermissions)

	// 元数据路由
	group.GET("/objects", casbinController.GetAllObjects)
	group.GET("/actions", casbinController.GetAllActions)

	group.POST("/reload", casbinController.ReloadPolicies)
}
