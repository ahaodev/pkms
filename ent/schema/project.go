package schema

import (
	"github.com/rs/xid"
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

/**
CREATE TABLE projects (
    id VARCHAR(50) PRIMARY KEY, -- 项目唯一标识
    name VARCHAR(255) NOT NULL, -- 项目名称
    description TEXT, -- 项目描述
    icon VARCHAR(100), -- 项目图标
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 更新时间
    package_count INTEGER NOT NULL DEFAULT 0, -- 包数量，自动维护
    created_by VARCHAR(50) NOT NULL, -- 创建者用户ID
    is_public BOOLEAN NOT NULL DEFAULT 0, -- 是否公开
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE -- 关联用户表
);
*/

// Project holds the schema definition for the Project entity.
type Project struct {
	ent.Schema
}

// Fields of the Project.
func (Project) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").
			DefaultFunc(func() string {
				return xid.New().String()
			}),
		field.String("name").
			MaxLen(255),
		field.String("description").
			Optional(),
		field.String("icon").
			MaxLen(100).
			Optional(),
		field.Time("created_at").
			Default(time.Now),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
		field.String("created_by").
			MaxLen(20),
		field.String("tenant_id").MaxLen(20),
	}
}

// Edges of the Project.
func (Project) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("creator", User.Type).
			Ref("created_projects").
			Field("created_by").
			Unique().
			Required(),
		edge.From("tenant", Tenant.Type).
			Ref("projects").Field("tenant_id").Required().Unique(),
		edge.To("packages", Packages.Type),
		edge.To("upgrades", Upgrade.Type),
	}
}

// Indexes of the Project.
func (Project) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id"),
		index.Fields("created_by"),
	}
}
