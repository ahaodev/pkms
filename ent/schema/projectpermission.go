package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/rs/xid"
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

// ProjectPermission holds the schema definition for the ProjectPermission entity.
type ProjectPermission struct {
	ent.Schema
}

// Fields of the ProjectPermission.
func (ProjectPermission) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").
			Default(xid.New().String()),
		field.String("user_id").
			MaxLen(20),
		field.String("project_id").
			MaxLen(20),
		field.Bool("can_view").
			Default(false),
		field.Bool("can_edit").
			Default(false),
	}
}

// Edges of the ProjectPermission.
func (ProjectPermission) Edges() []ent.Edge {
	return []ent.Edge{
		// Permission belongs to a user
		edge.From("user", User.Type).
			Ref("project_permissions").
			Field("user_id").
			Unique().
			Required(),
		// Permission belongs to a project
		edge.From("project", Project.Type).
			Ref("user_permissions").
			Field("project_id").
			Unique().
			Required(),
	}
}

// Indexes of the ProjectPermission.
func (ProjectPermission) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("user_id"),
		index.Fields("project_id"),
		index.Fields("user_id", "project_id").
			Unique(),
	}
}
