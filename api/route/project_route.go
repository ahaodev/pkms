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

func NewProjectRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, group *gin.RouterGroup) {
	pr := repository.NewProjectRepository(db)
	pc := &controller.ProjectController{
		ProjectUsecase: usecase.NewProjectUsecase(pr, timeout),
		Env:            env,
	}

	// Project CRUD operations
	group.GET("/", pc.GetProjects)         // GET /api/v1/projects
	group.POST("/", pc.CreateProject)      // POST /api/v1/projects
	group.GET("/:id", pc.GetProject)       // GET /api/v1/projects/:id
	group.PUT("/:id", pc.UpdateProject)    // PUT /api/v1/projects/:id
	group.DELETE("/:id", pc.DeleteProject) // DELETE /api/v1/projects/:id
}
