package schema

import (
	"github.com/rs/xid"
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Upgrade holds the schema definition for the Upgrade entity.
// 升级目标实体，用于设置项目、包、版本的升级目标，供客户端查询和下载
type Upgrade struct {
	ent.Schema
}

// Fields of the Upgrade.
func (Upgrade) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").
			DefaultFunc(func() string {
				return xid.New().String()
			}),
		field.String("tenant_id").MaxLen(20),
		field.String("project_id").MaxLen(50),
		field.String("package_id").MaxLen(50),
		field.String("release_id").MaxLen(50),
		field.String("name").
			MaxLen(255).
			Comment("升级目标名称"),
		field.String("description").
			Optional().
			Comment("升级目标描述"),
		field.Bool("is_active").
			Default(true).
			Comment("是否激活，用于启用/禁用升级目标"),
		field.String("created_by").
			MaxLen(50),
		field.Time("created_at").
			Default(time.Now),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
	}
}

// Edges of the Upgrade.
func (Upgrade) Edges() []ent.Edge {
	return []ent.Edge{
		// Upgrade belongs to a tenant
		edge.From("tenant", Tenant.Type).
			Ref("upgrades").
			Field("tenant_id").
			Required().
			Unique(),
		// Upgrade belongs to a project
		edge.From("project", Project.Type).
			Ref("upgrades").
			Field("project_id").
			Required().
			Unique(),
		// Upgrade belongs to a package
		edge.From("package", Packages.Type).
			Ref("upgrades").
			Field("package_id").
			Required().
			Unique(),
		// Upgrade targets a specific release
		edge.From("release", Release.Type).
			Ref("upgrades").
			Field("release_id").
			Required().
			Unique(),
		// Upgrade has a creator
		edge.From("creator", User.Type).
			Ref("created_upgrades").
			Field("created_by").
			Required().
			Unique(),
	}
}

// Indexes of the Upgrade.
func (Upgrade) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id"),
		index.Fields("project_id"),
		index.Fields("package_id"),
		index.Fields("release_id"),
		index.Fields("is_active"),
		index.Fields("created_at"),
		// 组合索引用于查询
		index.Fields("tenant_id", "is_active"),
		index.Fields("project_id", "is_active"),
		index.Fields("package_id", "is_active"),
	}
}
