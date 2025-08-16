package route

import (
	"pkms/api/controller"
	"pkms/api/middleware"
	"pkms/bootstrap"
	"pkms/ent"
	"pkms/internal/casbin"
	"pkms/repository"
	"pkms/usecase"
	"time"

	"github.com/gin-gonic/gin"
)

func NewUserTenantRoleRouter(
	env *bootstrap.Env,
	timeout time.Duration,
	db *ent.Client,
	casbinManager *casbin.CasbinManager,
	group *gin.RouterGroup,
) {
	// 初始化 repositories
	userTenantRoleRepository := repository.NewEntUserTenantRoleRepository(db)
	roleRepository := repository.NewRoleRepository(db)
	tenantRepository := repository.NewTenantRepository(db)

	// 初始化 usecase
	userTenantRoleUsecase := usecase.NewUserTenantRoleUsecase(
		userTenantRoleRepository,
		roleRepository,
		tenantRepository,
		casbinManager,
		timeout,
	)

	userTenantRoleController := &controller.UserTenantRoleController{
		UserTenantRoleUsecase: userTenantRoleUsecase,
		Env:                   env,
	}

	// 创建 Casbin 中间件
	casbinMiddleware := middleware.NewCasbinMiddleware(casbinManager)

	userTenantRoleGroup := group.Group("/user-tenant-role")
	userTenantRoleGroup.Use(middleware.JwtAuthMiddleware(env.AccessTokenSecret))

	// 管理员权限：角色分配和移除
	userTenantRoleGroup.POST("/assign",
		casbinMiddleware.RequireRole("admin"),
		userTenantRoleController.AssignUserTenantRoles)

	userTenantRoleGroup.POST("/remove",
		casbinMiddleware.RequireRole("admin"),
		userTenantRoleController.RemoveUserTenantRole)

	// 查询权限：用户角色信息
	userTenantRoleGroup.GET("/user/:userId/tenant/:tenantId/roles",
		casbinMiddleware.RequireAnyRole([]string{"admin", "pm", "user"}),
		userTenantRoleController.GetUserRolesByTenant)

	userTenantRoleGroup.GET("/user/:userId",
		casbinMiddleware.RequireAnyRole([]string{"admin", "pm", "user"}),
		userTenantRoleController.GetAllUserTenantRoles)

	userTenantRoleGroup.GET("/tenant/:tenantId/role/:roleId/users",
		casbinMiddleware.RequireAnyRole([]string{"admin", "pm", "user"}),
		userTenantRoleController.GetUsersByTenantRole)

	// 当前用户：无需特殊权限
	userTenantRoleGroup.GET("/current", userTenantRoleController.GetCurrentUserTenantRoles)
}
