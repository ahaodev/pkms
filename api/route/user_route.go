package route

import (
	"time"

	"pkms/api/controller"
	"pkms/bootstrap"
	"pkms/ent"
	"pkms/repository"
	"pkms/usecase"

	"github.com/gin-gonic/gin"
)

func NewUserRouter(app *bootstrap.Application, timeout time.Duration, db *ent.Client, group *gin.RouterGroup) {
	ur := repository.NewUserRepository(db)
	tr := repository.NewTenantRepository(db)
	uc := &controller.UserController{
		UserUsecase: usecase.NewUserUsecase(ur, tr, app.CasbinManager, timeout),
		Env:         app.Env,
	}

	// User CRUD operations
	group.GET("/", uc.GetUsers)         // GET /api/v1/users
	group.POST("/", uc.CreateUser)      // POST /api/v1/users
	group.GET("/:id", uc.GetUser)       // GET /api/v1/users/:id
	group.PUT("/:id", uc.UpdateUser)    // PUT /api/v1/users/:id
	group.DELETE("/:id", uc.DeleteUser) // DELETE /api/v1/users/:id

}
