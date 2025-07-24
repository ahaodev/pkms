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
}
