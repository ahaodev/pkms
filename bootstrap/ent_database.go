package bootstrap

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"pkms/domain"
	"pkms/ent"
	"pkms/ent/migrate"
	"pkms/ent/user"
	"pkms/internal/casbin"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

func NewEntDatabase(env *Env) *ent.Client {
	dbPath := env.DBPath

	if dbPath == "" {
		dbPath = "./data.db"
	}

	// Ensure the directory exists
	dir := filepath.Dir(dbPath)
	if dir != "" && dir != "." {
		if err := os.MkdirAll(dir, 0755); err != nil {
			log.Fatalf("Failed to create DB directory %s: %v", dir, err)
		}
		log.Printf("✅ Database directory ensured: %s", dir)
	}

	// Enable SQLite foreign keys via connection string
	dsn := fmt.Sprintf("file:%s?_fk=1", dbPath)
	client, err := ent.Open("sqlite3", dsn)
	if err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}

	// Auto migrate schema
	ctx := context.Background()
	if err := client.Schema.Create(ctx,
		migrate.WithDropIndex(true),
		migrate.WithDropColumn(true),
	); err != nil {
		log.Fatal("❌ Failed to create schema resources:", err)
	}

	log.Println("✅ Connected to SQLite database successfully with Ent")
	return client
}

// InitDefaultAdmin 初始化数据（如管理员用户、Casbin策略等）由外部调用以下函数
func InitDefaultAdmin(client *ent.Client, env *Env, casbinManager *casbin.CasbinManager) {
	ctx := context.Background()
	// 检查是否已存在管理员用户
	adminCount, err := client.User.Query().
		Where(user.UsernameEQ("admin")).
		Count(ctx)

	if err != nil {
		log.Printf("⚠️ Failed to check admin users: %v", err)
		return
	}

	if adminCount > 0 {
		log.Println("✅ Admin user already exists")
		return
	}

	// 从环境变量获取管理员信息，或使用默认值
	adminUsername := getEnvOrDefault(env.AdminUsername, "admin")
	adminPassword := getEnvOrDefault(env.AdminPassword, "123")

	log.Printf("📝 Creating admin user with password: %s", adminPassword)

	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("❌ Failed to hash admin password: %v", err)
		return
	}
	// 创建系统租户(创建用户时自动创建对应的租户)
	systemTenant, err := client.Tenant.Create().SetName("admin").Save(ctx)
	if err != nil {
		log.Printf("❌ Failed to create system tenant: %v", err)
		return
	}
	// 创建管理员用户
	adminUser, err := client.User.Create().
		SetUsername(adminUsername).
		SetPasswordHash(string(hashedPassword)).
		SetIsActive(true).
		AddTenants(systemTenant).
		Save(ctx)

	if err != nil {
		log.Printf("❌ Failed to create admin user: %v", err)
		return
	}
	// 使用新的默认权限系统
	err = casbinManager.AddDefaultPermissionsForUser(adminUser.ID, domain.TenantRoleOwner, "*")
	if err != nil {
		log.Printf("❌ Failed to add default permissions for admin user: %v", err)
	}
	log.Printf("✅ Default admin user created: %s", adminUsername)
	log.Println("⚠️ Please change the default password after first login!")
}

// getEnvOrDefault 获取环境变量值或返回默认值
func getEnvOrDefault(value, defaultValue string) string {
	if value == "" {
		return defaultValue
	}
	return value
}

// CloseEntConnection 关闭Ent数据库连接
func CloseEntConnection(client *ent.Client) {
	if client == nil {
		return
	}

	err := client.Close()
	if err != nil {
		log.Fatal("Failed to close database connection:", err)
	}

	log.Println("Database connection closed.")
}
