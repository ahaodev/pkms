package bootstrap

import (
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
	// 注意：InitDefaultAdmin 移到 main.go 中 RBAC 初始化之后执行
	// 初始化文件存储
	storageConfig := InitStorage(app.Env)
	app.MinioClient = storageConfig.MinioClient
	app.FileStorage = storageConfig.FileStorage

	return app
}

func (app *Application) CloseDBConnection() {
	CloseEntConnection(app.DB)
}
