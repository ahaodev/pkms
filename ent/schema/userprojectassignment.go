package schema

import (
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

// UserProjectAssignment holds the schema definition for the UserProjectAssignment entity.
type UserProjectAssignment struct {
	ent.Schema
}

// Fields of the UserProjectAssignment.
func (UserProjectAssignment) Fields() []ent.Field {
	return []ent.Field{
		field.Int("id").
			Unique(),
		field.String("user_id").
			MaxLen(50),
		field.String("project_id").
			MaxLen(50),
		field.Time("assigned_at").
			Default(time.Now),
		field.String("assigned_by").
			MaxLen(50),
	}
}

// Edges of the UserProjectAssignment.
func (UserProjectAssignment) Edges() []ent.Edge {
	return []ent.Edge{
		// Assignment belongs to a user
		edge.From("user", User.Type).
			Ref("project_assignments").
			Field("user_id").
			Unique().
			Required(),
		// Assignment belongs to a project
		edge.From("project", Project.Type).
			Ref("user_assignments").
			Field("project_id").
			Unique().
			Required(),
		// Assignment assigned by a user
		edge.From("assigner", User.Type).
			Ref("assigned_project_assignments").
			Field("assigned_by").
			Unique().
			Required(),
	}
}

// Indexes of the UserProjectAssignment.
func (UserProjectAssignment) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("user_id"),
		index.Fields("project_id"),
		index.Fields("user_id", "project_id").
			Unique(),
	}
}
