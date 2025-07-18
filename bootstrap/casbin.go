package bootstrap

import (
	"context"
	"log"
	"pkms/ent"
	"pkms/internal/casbin"
)

// InitializeCasbinPolicies 初始化 Casbin 权限策略
func InitializeCasbinPolicies(casbinManager *casbin.CasbinManager, db *ent.Client) {
	log.Println("🛡️ 正在初始化 Casbin 权限策略 ...")
	if casbinManager == nil {
		log.Println("❌ CasbinManager 初始化失败，无法导入策略")
		return
	}
	// 检查是否已经存在默认策略
	ctx := context.Background()
	count, err := db.CasbinRule.Query().Count(ctx)
	if err != nil {
		log.Printf("❌ 获取 Casbin 策略失败: %v", err)
		return
	}
	if (count) > 0 {
		log.Println("默认权限策略已存在，跳过初始化")
		return
	}
	if err := casbinManager.InitializeDefaultPolicies(); err != nil {
		log.Printf("❌ Casbin 策略初始化失败: %v", err)
		return
	}
	log.Println("✅ Casbin 权限策略初始化完成")
}
