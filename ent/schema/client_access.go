package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/rs/xid"
)

// ClientAccess holds the schema definition for the ClientAccess entity.
// 客户端接入凭证表，用于客户端安全接入升级服务
type ClientAccess struct {
	ent.Schema
}

// Fields of the ClientAccess.
func (ClientAccess) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").
			DefaultFunc(func() string {
				return xid.New().String()
			}),
		field.String("tenant_id").
			MaxLen(50).
			Comment("租户ID"),
		field.String("project_id").
			MaxLen(50).
			Comment("关联的项目ID"),
		field.String("package_id").
			MaxLen(50).
			Comment("关联的包ID"),
		field.String("access_token").
			Unique().
			Comment("客户端访问令牌"),
		field.String("name").
			MaxLen(255).
			Comment("客户端名称/描述"),
		field.String("description").
			Optional().
			Comment("详细描述"),
		field.Bool("is_active").
			Default(true).
			Comment("是否启用"),
		field.Time("expires_at").
			Optional().
			Comment("过期时间，为空表示永不过期"),
		field.Time("last_used_at").
			Optional().
			Comment("最后使用时间"),
		field.String("last_used_ip").
			MaxLen(45).
			Optional().
			Comment("最后使用IP地址"),
		field.Int("usage_count").
			Default(0).
			Comment("使用次数统计"),
		field.Time("created_at").
			Default(time.Now).
			Comment("创建时间"),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now).
			Comment("更新时间"),
		field.String("created_by").
			MaxLen(50).
			Comment("创建者ID"),
	}
}

// Edges of the ClientAccess.
func (ClientAccess) Edges() []ent.Edge {
	return []ent.Edge{
		// ClientAccess belongs to a tenant
		edge.From("tenant", Tenant.Type).
			Ref("client_accesses").
			Field("tenant_id").
			Unique().
			Required(),
		// ClientAccess belongs to a project
		edge.From("project", Project.Type).
			Ref("client_accesses").
			Field("project_id").
			Unique().
			Required(),
		// ClientAccess belongs to a package
		edge.From("package", Packages.Type).
			Ref("client_accesses").
			Field("package_id").
			Unique().
			Required(),
		// ClientAccess has a creator
		edge.From("creator", User.Type).
			Ref("created_client_accesses").
			Field("created_by").
			Unique().
			Required(),
	}
}

// Indexes of the ClientAccess.
func (ClientAccess) Indexes() []ent.Index {
	return []ent.Index{
		// 访问令牌唯一索引
		index.Fields("access_token").
			Unique(),
		// 租户+项目+包组合索引
		index.Fields("tenant_id", "project_id", "package_id"),
		// 状态和过期时间索引
		index.Fields("is_active", "expires_at"),
		// 创建时间索引
		index.Fields("created_at"),
		// 最后使用时间索引
		index.Fields("last_used_at"),
	}
}
