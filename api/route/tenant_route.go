package route

import (
	"time"

	"pkms/api/controller"
	"pkms/bootstrap"
	"pkms/ent"
	"pkms/internal/casbin"
	"pkms/repository"
	"pkms/usecase"

	"github.com/gin-gonic/gin"
)

func NewTenantRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, casbinManager *casbin.CasbinManager, group *gin.RouterGroup) {
	tr := repository.NewTenantRepository(db)
	tc := &controller.TenantController{
		TenantUsecase: usecase.NewTenantUsecase(tr, casbinManager, timeout),
		CasbinManager: casbinManager,
		Env:           env,
	}

	// Tenant CRUD operations - only admin can access
	group.GET("/", tc.GetTenants)         // GET /api/v1/tenants
	group.POST("/", tc.CreateTenant)      // POST /api/v1/tenants
	group.GET("/:id", tc.GetTenant)       // GET /api/v1/tenants/:id
	group.PUT("/:id", tc.UpdateTenant)    // PUT /api/v1/tenants/:id
	group.DELETE("/:id", tc.DeleteTenant) // DELETE /api/v1/tenants/:id

	// Tenant user management
	group.GET("/:id/users", tc.GetTenantUsers)                  // GET /api/v1/tenants/:id/users
	group.POST("/:id/users", tc.AddUserToTenant)                // POST /api/v1/tenants/:id/users
	group.DELETE("/:id/users/:userId", tc.RemoveUserFromTenant) // DELETE /api/v1/tenants/:id/users/:userId

	// 租户用户角色管理接口（基于Casbin）
	group.GET("/:id/users-with-roles", tc.GetTenantUsersWithRole)  // GET /api/v1/tenants/:id/users-with-roles
	group.POST("/:id/users/:userId/roles", tc.UpdateTenantUserRole)    // POST /api/v1/tenants/:id/users/:userId/roles
	group.GET("/:id/users/:userId/roles", tc.GetTenantUserRole)     // GET /api/v1/tenants/:id/users/:userId/roles
	group.DELETE("/:id/users/:userId/roles", tc.RemoveUserFromTenant) // DELETE /api/v1/tenants/:id/users/:userId/roles

	// 用户租户关系查询
	group.GET("/users/:userId/tenants", tc.GetUserTenants) // GET /api/v1/tenants/users/:userId/tenants
}