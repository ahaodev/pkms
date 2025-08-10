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
	"strings"

	_ "github.com/lib/pq"
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

func NewEntDatabase(env *Env) *ent.Client {
	var client *ent.Client
	var err error

	// Determine database type
	dbType := strings.ToLower(env.DBType)
	if dbType == "" {
		dbType = "sqlite"
	}

	log.Printf("🔗 Database Initialization:")
	log.Printf("  - Type: %s", strings.ToUpper(dbType))

	switch dbType {
	case "postgres", "postgresql":
		client, err = connectPostgreSQL(env)
	case "sqlite", "sqlite3":
		client, err = connectSQLite()
	default:
		log.Fatalf("❌ Unsupported database type: %s. Supported types: sqlite, postgres", dbType)
	}

	if err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}

	// Auto migrate schema
	log.Printf("📋 Running database schema migration...")
	ctx := context.Background()
	if err := client.Schema.Create(ctx,
		migrate.WithDropIndex(true),
		migrate.WithDropColumn(true),
	); err != nil {
		log.Fatal("❌ Failed to create schema resources:", err)
	}

	log.Printf("✅ Database schema migration completed")
	log.Printf("✅ Connected to %s database successfully with Ent", strings.ToUpper(dbType))
	return client
}

func connectSQLite() (*ent.Client, error) {
	// 修改这里：确保路径指向 .db 文件
	dbPath := "./database/data.db"

	log.Printf("📄 SQLite Config:")
	log.Printf("  - Database Path: %s", dbPath)

	// 确保目录存在
	dir := filepath.Dir(dbPath)
	if dir != "" && dir != "." {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return nil, fmt.Errorf("failed to create DB directory %s: %v", dir, err)
		}
		log.Printf("✅ Database directory ensured: %s", dir)
	}

	// 启用 SQLite 外键约束
	dsn := fmt.Sprintf("file:%s?_fk=1", dbPath)
	log.Printf("📡 Connecting to SQLite database...")
	return ent.Open("sqlite3", dsn)
}

func connectPostgreSQL(env *Env) (*ent.Client, error) {
	dsn := env.DBDSN
	if dsn == "" {
		return nil, fmt.Errorf("PostgreSQL DSN is required but not provided")
	}

	log.Printf("📄 PostgreSQL Config:")
	log.Printf("  - DSN: %s", maskPassword(dsn))
	log.Printf("📡 Connecting to PostgreSQL database...")

	client, err := ent.Open("postgres", dsn)
	if err != nil {
		log.Printf("❌ PostgreSQL connection failed: %v", err)
		return nil, err
	}

	// Test connection by performing a simple query
	ctx := context.Background()
	if _, err := client.User.Query().Count(ctx); err != nil {
		log.Printf("❌ PostgreSQL connection test failed: %v", err)
		return nil, err
	}

	log.Printf("✅ PostgreSQL connection test successful")
	return client, nil
}

// maskPassword masks the password in DSN for logging
func maskPassword(dsn string) string {
	if strings.Contains(dsn, "@") {
		parts := strings.Split(dsn, "@")
		if len(parts) >= 2 {
			userInfo := parts[0]
			if strings.Contains(userInfo, ":") {
				userParts := strings.Split(userInfo, ":")
				if len(userParts) >= 3 {
					userParts[len(userParts)-1] = "***"
					parts[0] = strings.Join(userParts, ":")
				}
			}
			return strings.Join(parts, "@")
		}
	}
	return dsn
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
	ok, err := casbinManager.AddPolicy(domain.TenantRoleOwner, systemTenant.ID, "*", "*")
	if err != nil {
		log.Printf("❌ add policy error: %v", err)
	}
	log.Printf("✅ Add Policy: %v", ok)
	// 使用新的默认权限系统
	ok, err = casbinManager.AddRoleForUser(adminUser.ID, domain.TenantRoleOwner, systemTenant.ID)
	if err != nil {
		log.Printf("❌ add role for user error: %v", err)
	}
	log.Printf("✅ Add Role For User: %v", ok)
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
