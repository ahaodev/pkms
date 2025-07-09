package schema

import (
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

// GroupPermission holds the schema definition for the GroupPermission entity.
type GroupPermission struct {
	ent.Schema
}

// Fields of the GroupPermission.
func (GroupPermission) Fields() []ent.Field {
	return []ent.Field{
		field.Int("id").
			Unique(),
		field.String("group_id").
			MaxLen(50),
		field.String("project_id").
			MaxLen(50),
		field.Bool("can_view").
			Default(false),
		field.Bool("can_edit").
			Default(false),
	}
}

// Edges of the GroupPermission.
func (GroupPermission) Edges() []ent.Edge {
	return []ent.Edge{
		// Permission belongs to a group
		edge.From("group", Group.Type).
			Ref("permissions").
			Field("group_id").
			Unique().
			Required(),
		// Permission belongs to a project
		edge.From("project", Project.Type).
			Ref("group_permissions").
			Field("project_id").
			Unique().
			Required(),
	}
}

// Indexes of the GroupPermission.
func (GroupPermission) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("group_id"),
		index.Fields("project_id"),
		index.Fields("group_id", "project_id").
			Unique(),
	}
}
