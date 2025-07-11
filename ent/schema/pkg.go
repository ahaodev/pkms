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

// Pkg holds the schema definition for the Pkg entity.
type Pkg struct {
	ent.Schema
}

// Fields of the Pkg.
func (Pkg) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").
			DefaultFunc(func() string {
				return xid.New().String()
			}),
		field.String("project_id").
			MaxLen(20),
		field.String("name").
			MaxLen(255),
		field.String("description").
			Optional(),
		field.Enum("type").
			Values("android", "web", "desktop", "linux", "other"),
		field.String("version").
			MaxLen(50),
		field.String("file_url").
			MaxLen(500),
		field.String("file_name").
			MaxLen(255),
		field.Int64("file_size"),
		field.String("checksum").
			MaxLen(255),
		field.String("changelog").
			Optional(),
		field.Bool("is_latest").
			Default(false),
		field.Int("download_count").
			Default(0),
		field.Time("created_at").
			Default(time.Now),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
		field.Int("version_code"),
		field.String("share_token").
			MaxLen(255).
			Unique(),
		field.Time("share_expiry").
			Optional(),
		field.Bool("is_public").
			Default(false),
	}
}

// Edges of the Pkg.
func (Pkg) Edges() []ent.Edge {
	return []ent.Edge{
		// Package belongs to a project
		edge.From("project", Project.Type).
			Ref("packages").
			Field("project_id").
			Unique().
			Required(),
	}
}

// Indexes of the Pkg.
func (Pkg) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("project_id"),
		index.Fields("type"),
		index.Fields("is_latest"),
		index.Fields("share_token"),
		index.Fields("created_at"),
	}
}
