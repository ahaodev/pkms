package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/rs/xid"
)

// Role holds the schema definition for the Role entity.
type Role struct {
	ent.Schema
}

// Fields of the Role.
func (Role) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").
			DefaultFunc(func() string {
				return xid.New().String()
			}),
		field.String("name").
			Comment("角色名称"),
		field.String("code").
			Comment("角色代码，用于Casbin策略"),
		field.Text("description").
			Optional().
			Comment("角色描述"),
		field.String("tenant_id").
			Optional().
			Comment("租户ID，为空表示系统全局角色"),
		field.Bool("is_system").
			Default(false).
			Comment("是否为系统内置角色，内置角色不可删除"),
		field.Bool("is_active").
			Default(true).
			Comment("是否启用"),
		field.Time("created_at").
			Default(time.Now).
			Comment("创建时间"),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now).
			Comment("更新时间"),
	}
}

// Edges of the Role.
func (Role) Edges() []ent.Edge {
	return []ent.Edge{
		// 角色关联的菜单（多对多）
		edge.To("menus", Menu.Type),
		// 拥有该角色的用户（多对多）
		edge.From("users", User.Type).
			Ref("roles"),
		// Role has tenant role assignments
		edge.To("user_tenant_roles", UserTenantRole.Type),
	}
}

// Indexes of the Role.
func (Role) Indexes() []ent.Index {
	return []ent.Index{
		// 租户内角色代码唯一
		index.Fields("tenant_id", "code").Unique(),
		// 租户内角色名称唯一
		index.Fields("tenant_id", "name").Unique(),
		// 按租户查询
		index.Fields("tenant_id"),
		// 按启用状态查询
		index.Fields("is_active"),
		// 按系统角色查询
		index.Fields("is_system"),
	}
}
