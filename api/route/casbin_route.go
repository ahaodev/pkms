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

	// 角色管理路由
	group.POST("/roles", casbinController.AddRole)
	group.DELETE("/roles", casbinController.RemoveRole)
	group.GET("/roles", casbinController.GetAllRoles)
	group.GET("/roles/:role/users", casbinController.GetRoleUsers)

	// 用户权限路由
	group.GET("/users/:user_id/permissions", casbinController.GetUserPermissions)
	group.GET("/users/:user_id/roles", casbinController.GetUserRoles)

	// 系统管理路由
	group.POST("/initialize", casbinController.InitializePolicies)
	group.POST("/reload", casbinController.ReloadPolicies)
}
