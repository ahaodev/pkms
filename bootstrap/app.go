package bootstrap

import (
	"fmt"
	"strings"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"pkms/domain"
	"pkms/ent"
	"pkms/internal/casbin"
	"pkms/repository"
)

type Application struct {
	Env           *Env
	DB            *ent.Client
	MinioClient   *minio.Client         // 保留兼容性
	FileStorage   domain.FileRepository // 新的通用文件存储接口
	CasbinManager *casbin.CasbinManager
}

func App() Application {
	app := &Application{}
	app.Env = NewEnv()
	app.DB = NewEntDatabase(app.Env)
	app.CasbinManager = casbin.NewCasbinManager(app.DB)
	// 初始化DB
	InitDefaultAdmin(app.DB, app.Env, app.CasbinManager)
	InitDefaultUser(app.DB, "ahao", "123", app.CasbinManager)
	InitDefaultUser(app.DB, "test", "123", app.CasbinManager)

	// 根据配置初始化文件存储
	storageType := strings.ToLower(app.Env.StorageType)
	switch storageType {
	case "minio":
		// 初始化 MinIO 客户端
		minioClient, err := minio.New(app.Env.S3Address, &minio.Options{
			Creds:  credentials.NewStaticV4(app.Env.S3AccessKey, app.Env.S3SecretKey, app.Env.S3Token),
			Secure: false,
		})
		if err != nil {
			panic("Failed to connect to MinIO: " + err.Error())
		}
		app.MinioClient = minioClient
		app.FileStorage = repository.NewFileRepository(minioClient)
		fmt.Println("文件存储: 使用 MinIO 对象存储")
	case "disk":
		// 初始化本地磁盘存储
		app.FileStorage = repository.NewDiskFileRepository(app.Env.StorageBasePath)
		fmt.Printf("文件存储: 使用本地磁盘存储 (%s)\n", app.Env.StorageBasePath)
	default:
		// 默认使用本地磁盘存储
		app.FileStorage = repository.NewDiskFileRepository(app.Env.StorageBasePath)
		fmt.Printf("文件存储: 使用默认本地磁盘存储 (%s)\n", app.Env.StorageBasePath)
	}

	return *app
}

func (app *Application) CloseDBConnection() {
	CloseEntConnection(app.DB)
}
