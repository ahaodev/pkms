package route

import (
	"time"

	"pkms/api/controller"
	"pkms/bootstrap"
	"pkms/domain"
	"pkms/ent"
	"pkms/repository"
	"pkms/usecase"

	"github.com/gin-gonic/gin"
)

func NewShareRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, fileStorage domain.FileRepository, group *gin.RouterGroup) {
	shareRepo := repository.NewShareRepository(db)
	releaseRepo := repository.NewReleaseRepository(db)

	sc := &controller.ShareController{
		ShareUsecase:   usecase.NewShareUsecase(shareRepo, releaseRepo, timeout),
		ReleaseUsecase: usecase.NewReleaseUsecase(releaseRepo, nil, fileStorage, env, timeout),
		FileUsecase:    usecase.NewFileUsecase(fileStorage, timeout),
		Env:            env,
	}
	group.GET("/:code", sc.DownloadSharedRelease) // GET /share/:code - 直接下载分享的文件
}

func NewShareManagementRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, fileStorage domain.FileRepository, group *gin.RouterGroup) {
	shareRepo := repository.NewShareRepository(db)
	releaseRepo := repository.NewReleaseRepository(db)

	sc := &controller.ShareController{
		ShareUsecase:   usecase.NewShareUsecase(shareRepo, releaseRepo, timeout),
		ReleaseUsecase: usecase.NewReleaseUsecase(releaseRepo, nil, fileStorage, env, timeout),
		FileUsecase:    usecase.NewFileUsecase(fileStorage, timeout),
		Env:            env,
	}

	// Share management endpoints (requires authentication)
	group.GET("/", sc.GetShares)         // GET /api/v1/shares
	group.DELETE("/:id", sc.DeleteShare) // DELETE /api/v1/shares/:id
}
