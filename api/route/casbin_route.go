package route

import (
	"pkms/api/controller"
	"pkms/ent"
	"pkms/internal/casbin"
	"pkms/repository"

	"github.com/gin-gonic/gin"
)

// NewCasbinRouter 创建 Casbin 权限管理路由
func NewCasbinRouter(db *ent.Client, casbinManager *casbin.CasbinManager, group *gin.RouterGroup) {
	// 创建仓储
	userRepository := repository.NewUserRepository(db)
	tenantRepository := repository.NewTenantRepository(db)

	// 创建控制器
	casbinController := controller.NewCasbinController(casbinManager, userRepository, tenantRepository)

	// 策略管理路由
	group.POST("/policies", casbinController.AddPolicy)
	group.DELETE("/policies", casbinController.RemovePolicy)
	group.GET("/policies", casbinController.GetAllPolicies)
	group.POST("/policies/check", casbinController.CheckPermission)

	// 角色管理路由
	group.POST("/roles", casbinController.AddRole)
	group.DELETE("/roles", casbinController.RemoveRole)
	group.GET("/roles", casbinController.GetAllRoles)
	group.GET("/roles/names", casbinController.GetAllRoleNames)
	group.GET("/roles/:role/users", casbinController.GetRoleUsers)
	group.GET("/roles/:role/permissions", casbinController.GetRolePermissions)

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

	// 增强版路由（包含可读名称）
	group.GET("/policies/enhanced", casbinController.GetEnhancedPolicies)
	group.GET("/roles/enhanced", casbinController.GetEnhancedRoles)

	// 数据源路由（用于下拉选择）
	group.GET("/tenants", casbinController.GetAllTenants)
	group.GET("/users", casbinController.GetAllUsers)

	group.POST("/reload", casbinController.ReloadPolicies)
}
