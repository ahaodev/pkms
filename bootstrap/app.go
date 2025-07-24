package bootstrap

import (
	"context"
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

func App() Application {
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

	// 运行数据库权限修复
	err = RunPermissionsMigration(app.DB, app.CasbinManager)
	if err != nil {
		log.Printf("⚠️ Failed to run permissions migration: %v", err)
	} else {
		log.Println("✅ Permissions migration completed")
	}

	// 初始化DB
	InitDefaultAdmin(app.DB, app.Env, app.CasbinManager)
	InitDefaultUser(app.DB, "ahao", "123", app.CasbinManager)
	InitDefaultUser(app.DB, "test", "123", app.CasbinManager)

	// 初始化文件存储
	storageConfig := InitStorage(app.Env)
	app.MinioClient = storageConfig.MinioClient
	app.FileStorage = storageConfig.FileStorage

	return *app
}

func (app *Application) CloseDBConnection() {
	CloseEntConnection(app.DB)
}

// RunPermissionsMigration 运行权限数据库迁移
func RunPermissionsMigration(db *ent.Client, casbinManager *casbin.CasbinManager) error {
	ctx := context.Background()

	log.Println("🔧 开始权限数据迁移...")

	// 第一步：清理无效的角色权限（使用通配符域的非系统管理员角色权限）
	err := casbinManager.CleanupInvalidRolePermissions()
	if err != nil {
		return err
	}

	// 第二步：获取所有现有租户
	tenants, err := db.Tenant.Query().All(ctx)
	if err != nil {
		log.Printf("获取租户列表失败: %v", err)
		return err
	}

	var tenantIDs []string
	for _, tenant := range tenants {
		tenantIDs = append(tenantIDs, tenant.ID)
	}

	// 第三步：为所有现有租户初始化角色权限
	err = casbinManager.InitializeExistingTenantsRolePermissions(tenantIDs)
	if err != nil {
		return err
	}

	log.Println("✅ 权限数据迁移完成")
	return nil
}
