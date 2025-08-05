package bootstrap

import (
	"log"

	"github.com/minio/minio-go/v7"
	"pkms/domain"
	"pkms/ent"
	"pkms/internal/casbin"
)

type Application struct {
	Env           *Env
	DB            *ent.Client
	MinioClient   *minio.Client         // 保留兼容性
	FileStorage   domain.FileRepository // 新的通用文件存储接口
	CasbinManager *casbin.CasbinManager
}

func App() *Application {
	app := &Application{}
	app.Env = NewEnv()
	app.DB = NewEntDatabase(app.Env)
	app.CasbinManager = casbin.NewCasbinManager(app.DB)

	// 只初始化系统管理员权限（可跨租户）
	err := app.CasbinManager.InitializeSystemAdminPermissions()
	if err != nil {
		log.Printf("⚠️ Failed to initialize system admin permissions: %v", err)
	} else {
		log.Println("✅ System admin permissions initialized")
	}

	// 初始化DB
	InitDefaultAdmin(app.DB, app.Env, app.CasbinManager)

	// 初始化文件存储
	storageConfig := InitStorage(app.Env)
	app.MinioClient = storageConfig.MinioClient
	app.FileStorage = storageConfig.FileStorage

	return app
}

func (app *Application) CloseDBConnection() {
	CloseEntConnection(app.DB)
}
