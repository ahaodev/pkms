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

func NewGroupRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, group *gin.RouterGroup) {
	gr := repository.NewGroupRepository(db)
	gc := &controller.GroupController{
		GroupUsecase: usecase.NewGroupUsecase(gr, timeout),
		Env:          env,
	}

	// Group CRUD operations
	group.GET("/", gc.GetGroups)         // GET /api/v1/groups
	group.POST("/", gc.CreateGroup)      // POST /api/v1/groups
	group.GET("/:id", gc.GetGroup)       // GET /api/v1/groups/:id
	group.PUT("/:id", gc.UpdateGroup)    // PUT /api/v1/groups/:id
	group.DELETE("/:id", gc.DeleteGroup) // DELETE /api/v1/groups/:id

	// Group membership operations
	group.GET("/:id/members", gc.GetGroupMembers)              // GET /api/v1/groups/:id/members
	group.POST("/:id/members", gc.AddGroupMember)              // POST /api/v1/groups/:id/members
	group.DELETE("/:id/members/:userId", gc.RemoveGroupMember) // DELETE /api/v1/groups/:id/members/:userId

	// Group permissions operations
	group.GET("/:id/permissions", gc.GetGroupPermissions)  // GET /api/v1/groups/:id/permissions
	group.POST("/:id/permissions", gc.SetGroupPermissions) // POST /api/v1/groups/:id/permissions
}
