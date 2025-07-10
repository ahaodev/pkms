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

func NewUserRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, group *gin.RouterGroup) {
	ur := repository.NewUserRepository(db)
	uc := &controller.UserController{
		UserUsecase: usecase.NewUserUsecase(ur, timeout),
		Env:         env,
	}

	// User CRUD operations
	group.GET("/", uc.GetUsers)         // GET /api/v1/users
	group.POST("/", uc.CreateUser)      // POST /api/v1/users
	group.GET("/:id", uc.GetUser)       // GET /api/v1/users/:id
	group.PUT("/:id", uc.UpdateUser)    // PUT /api/v1/users/:id
	group.DELETE("/:id", uc.DeleteUser) // DELETE /api/v1/users/:id

	// User specific operations
	group.GET("/:id/projects", uc.GetUserProjects)                       // GET /api/v1/users/:id/projects
	group.GET("/:id/groups", uc.GetUserGroups)                           // GET /api/v1/users/:id/groups
	group.POST("/:id/projects", uc.AssignUserToProject)                  // POST /api/v1/users/:id/projects
	group.DELETE("/:id/projects/:projectId", uc.UnassignUserFromProject) // DELETE /api/v1/users/:id/projects/:projectId
	group.GET("/profile", uc.GetProfile)                                 // GET /api/v1/users/profile
	group.PUT("/profile", uc.UpdateProfile)                              // PUT /api/v1/users/profile
}
