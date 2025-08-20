package initializer

import (
	"log"
	"pkms/ent"
	"pkms/internal/casbin"
)

// RBACInitializer RBAC系统初始化器（简化版）
type RBACInitializer struct {
	client        *ent.Client
	casbinManager *casbin.CasbinManager
}

// NewRBACInitializer 创建RBAC初始化器
func NewRBACInitializer(client *ent.Client, casbinManager *casbin.CasbinManager) *RBACInitializer {
	return &RBACInitializer{
		client:        client,
		casbinManager: casbinManager,
	}
}

// Initialize 初始化RBAC系统（简化版 - 只需要确保Casbin正常工作）
func (ri *RBACInitializer) Initialize() error {
	log.Println("开始初始化RBAC系统（简化版）...")
	
	// 角色现在使用常量定义，不需要数据库存储
	// 只需要确保Casbin策略管理器正常工作
	
	log.Println("RBAC系统初始化完成（使用固定角色常量）")
	return nil
}