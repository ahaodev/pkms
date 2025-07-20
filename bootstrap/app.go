package bootstrap

import (
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"pkms/ent"
	"pkms/internal/casbin"
)

type Application struct {
	Env           *Env
	DB            *ent.Client
	MinioClient   *minio.Client
	CasbinManager *casbin.CasbinManager
}

func App() Application {
	app := &Application{}
	app.Env = NewEnv()
	app.DB = NewEntDatabase(app.Env)
	app.CasbinManager = casbin.NewCasbinManager(app.DB)
	// 初始化DB
	InitDefaultAdmin(app.DB, app.Env, app.CasbinManager)
	InitDefaultUser(app.DB, app.Env, app.CasbinManager)
	// 初始化 MinIO 客户端
	minioClient, err := minio.New(app.Env.S3Address, &minio.Options{
		Creds:  credentials.NewStaticV4(app.Env.S3AccessKey, app.Env.S3SecretKey, app.Env.S3Token),
		Secure: false,
	})
	if err != nil {
		panic("Failed to connect to MinIO: " + err.Error())
	}
	app.MinioClient = minioClient
	return *app
}

func (app *Application) CloseDBConnection() {
	CloseEntConnection(app.DB)
}
