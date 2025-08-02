package route

import (
	"time"

	"pkms/bootstrap"
	"pkms/ent"

	"github.com/gin-gonic/gin"
)

func NewSettingRouter(app *bootstrap.Application, timeout time.Duration, db *ent.Client, group *gin.RouterGroup) {
	//sc := &controller.SettingController{
	//	Env: app.Env,
	//}
}
