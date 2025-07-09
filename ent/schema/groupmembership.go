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

// GroupMembership holds the schema definition for the GroupMembership entity.
type GroupMembership struct {
	ent.Schema
}

// Fields of the GroupMembership.
func (GroupMembership) Fields() []ent.Field {
	return []ent.Field{
		field.Int("id").
			Unique(),
		field.String("user_id").
			MaxLen(50),
		field.String("group_id").
			MaxLen(50),
		field.Time("joined_at").
			Default(time.Now),
		field.String("added_by").
			MaxLen(50),
	}
}

// Edges of the GroupMembership.
func (GroupMembership) Edges() []ent.Edge {
	return []ent.Edge{
		// Membership belongs to a user
		edge.From("user", User.Type).
			Ref("group_memberships").
			Field("user_id").
			Unique().
			Required(),
		// Membership belongs to a group
		edge.From("group", Group.Type).
			Ref("memberships").
			Field("group_id").
			Unique().
			Required(),
		// Membership added by a user
		edge.From("adder", User.Type).
			Ref("added_group_memberships").
			Field("added_by").
			Unique().
			Required(),
	}
}

// Indexes of the GroupMembership.
func (GroupMembership) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("user_id"),
		index.Fields("group_id"),
		index.Fields("user_id", "group_id").
			Unique(),
	}
}
