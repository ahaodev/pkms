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

func NewPermissionRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, group *gin.RouterGroup) {
	pr := repository.NewPermissionRepository(db)
	pc := &controller.PermissionsController{
		PermissionUsecase: usecase.NewPermissionUsecase(pr, timeout),
		Env:               env,
	}

	// User permissions operations
	group.GET("/users/:userId", pc.GetUserPermissions)                          // GET /api/v1/permissions/users/:userId
	group.POST("/users/:userId", pc.SetUserPermissions)                         // POST /api/v1/permissions/users/:userId
	group.DELETE("/users/:userId/projects/:projectId", pc.RemoveUserPermission) // DELETE /api/v1/permissions/users/:userId/projects/:projectId

	// Group permissions operations
	group.GET("/groups/:groupId", pc.GetGroupPermissions)                          // GET /api/v1/permissions/groups/:groupId
	group.POST("/groups/:groupId", pc.SetGroupPermissions)                         // POST /api/v1/permissions/groups/:groupId
	group.DELETE("/groups/:groupId/projects/:projectId", pc.RemoveGroupPermission) // DELETE /api/v1/permissions/groups/:groupId/projects/:projectId

	// Project permissions operations
	group.GET("/projects/:projectId", pc.GetProjectPermissions) // GET /api/v1/permissions/projects/:projectId

	// Permission checking
	group.POST("/check", pc.CheckPermission) // POST /api/v1/permissions/check
}
