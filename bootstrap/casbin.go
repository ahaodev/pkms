package bootstrap

import (
	"log"
	"pkms/internal/casbin"
)

// 初始化 Casbin 权限策略
func InitializeCasbinPolicies(casbinManager *casbin.CasbinManager) {
	log.Println("🛡️ 正在初始化 Casbin 权限策略 ...")
	if casbinManager == nil {
		log.Println("❌ CasbinManager 初始化失败，无法导入策略")
		return
	}
	// 检查是否已经存在默认策略
	policies, err := casbinManager.GetEnforcer().GetPolicy()
	if err != nil {
		log.Printf("❌ 获取 Casbin 策略失败: %v", err)
		return
	}
	if len(policies) > 0 {
		log.Println("默认权限策略已存在，跳过初始化")
		return
	}
	if err := casbinManager.InitializeDefaultPolicies(); err != nil {
		log.Printf("❌ Casbin 策略初始化失败: %v", err)
		return
	}
	log.Println("✅ Casbin 权限策略初始化完成")
}
