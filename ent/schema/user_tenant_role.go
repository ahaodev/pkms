package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/rs/xid"
)

// UserTenantRole holds the schema definition for the UserTenantRole entity.
// 用户在特定租户下的角色关联表
type UserTenantRole struct {
	ent.Schema
}

// Fields of the UserTenantRole.
func (UserTenantRole) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").
			DefaultFunc(func() string {
				return xid.New().String()
			}),
		field.String("user_id").
			Comment("用户ID"),
		field.String("tenant_id").
			Comment("租户ID"),
		field.String("role_code").
			Comment("角色代码(admin/owner/user/viewer)"),
		field.Time("created_at").
			Default(time.Now).
			Comment("创建时间"),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now).
			Comment("更新时间"),
	}
}

// Edges of the UserTenantRole.
func (UserTenantRole) Edges() []ent.Edge {
	return []ent.Edge{
		// 关联用户
		edge.To("user", User.Type).
			Unique().
			Required().
			Field("user_id"),
		// 关联租户
		edge.To("tenant", Tenant.Type).
			Unique().
			Required().
			Field("tenant_id"),
	}
}

// Indexes of the UserTenantRole.
func (UserTenantRole) Indexes() []ent.Index {
	return []ent.Index{
		// 用户在同一租户下的角色唯一
		index.Fields("user_id", "tenant_id", "role_code").Unique(),
		// 按用户查询
		index.Fields("user_id"),
		// 按租户查询
		index.Fields("tenant_id"),
		// 按角色查询
		index.Fields("role_code"),
		// 按用户和租户查询
		index.Fields("user_id", "tenant_id"),
	}
}
