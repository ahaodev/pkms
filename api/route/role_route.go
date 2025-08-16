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

func NewRoleRouter(
	env *bootstrap.Env,
	timeout time.Duration,
	db *ent.Client,
	casbinManager *casbin.CasbinManager,
	group *gin.RouterGroup,
) {
	// 初始化 repositories
	roleRepository := repository.NewRoleRepository(db)
	menuRepository := repository.NewMenuRepository(db)
	userRepository := repository.NewUserRepository(db)

	// 初始化 usecase
	roleUsecase := usecase.NewRoleUsecase(
		roleRepository,
		menuRepository,
		userRepository,
		casbinManager,
		timeout,
	)

	// 初始化 controller
	roleController := &controller.RoleController{
		RoleUsecase: roleUsecase,
		Env:         env,
	}

	// 角色管理路由
	group.GET("", roleController.GetRoles)          // 获取角色列表
	group.POST("", roleController.CreateRole)       // 创建角色
	group.GET("/:id", roleController.GetRole)       // 获取角色详情
	group.PUT("/:id", roleController.UpdateRole)    // 更新角色
	group.DELETE("/:id", roleController.DeleteRole) // 删除角色

	// 角色用户管理路由
	group.POST("/:id/assign", roleController.AssignRoleToUsers)   // 分配角色给用户
	group.POST("/:id/remove", roleController.RemoveRoleFromUsers) // 移除用户角色
	group.GET("/:id/users", roleController.GetRoleUsers)          // 获取角色用户

	// 用户角色查询路由
	group.GET("/user", roleController.GetUserRoles)                 // 获取当前用户角色
	group.GET("/user/:userId", roleController.GetUserRolesByUserID) // 获取指定用户角色

	// 角色权限管理路由
	group.POST("/:id/menus", roleController.AssignMenusToRole)       // 分配菜单给角色
	group.GET("/:id/permissions", roleController.GetRolePermissions) // 获取角色权限
}
