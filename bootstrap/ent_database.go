package bootstrap

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"pkms/ent/migrate"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
	"pkms/ent"
	"pkms/ent/user"
)

func NewEntDatabase(env *Env) *ent.Client {
	dbPath := env.DBPath
	if dbPath == "" {
		dbPath = "./database.db"
	}

	// 检查数据库是否已存在
	isNewDB := !fileExists(dbPath)

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

	// 如果是新数据库，创建默认管理员用户
	if isNewDB {
		createDefaultAdmin(ctx, client, env)
	}

	log.Println("✅ Connected to SQLite database successfully with Ent")
	return client
}

func createDefaultAdmin(ctx context.Context, client *ent.Client, env *Env) {
	// 检查是否已存在管理员用户
	adminCount, err := client.User.Query().
		Where(user.RoleEQ("admin")).
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
	adminPassword := getEnvOrDefault(env.AdminPassword, "admin")
	adminUsername := getEnvOrDefault(env.AdminUsername, "admin")

	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("❌ Failed to hash admin password: %v", err)
		return
	}

	// 创建管理员用户
	_, err = client.User.Create().
		SetUsername(adminUsername).
		SetPasswordHash(string(hashedPassword)).
		SetRole("admin").
		SetIsActive(true).
		Save(ctx)

	if err != nil {
		log.Printf("❌ Failed to create admin user: %v", err)
		return
	}

	log.Printf("✅ Default admin user created: %s", adminUsername)
	log.Println("⚠️ Please change the default password after first login!")
}

func fileExists(filename string) bool {
	_, err := os.Stat(filename)
	return !os.IsNotExist(err)
}

func getEnvOrDefault(value, defaultValue string) string {
	if value == "" {
		return defaultValue
	}
	return value
}
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
