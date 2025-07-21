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
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY, -- 用户唯一标识
    username VARCHAR(100) NOT NULL UNIQUE, -- 用户名，唯一
    email VARCHAR(255) NOT NULL UNIQUE, -- 邮箱，唯一
    password_hash VARCHAR(255) NOT NULL, -- 加密后的密码
    avatar VARCHAR(255), -- 头像链接
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')), -- 角色，admin 或 user
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 更新时间
    is_active BOOLEAN NOT NULL DEFAULT 1 -- 是否激活
);
*/

// User holds the schema definition for the User entity.
type User struct {
	ent.Schema
}

// Fields of the User.
func (User) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").
			DefaultFunc(func() string {
				return xid.New().String()
			}),
		field.String("username").
			MaxLen(32).
			Unique(),
		field.String("password_hash").
			Sensitive().
			MaxLen(128),
		field.String("avatar").
			MaxLen(255).
			Optional(),
		field.Time("created_at").
			Default(time.Now),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
		field.Bool("is_active").
			Default(true),
	}
}

// Edges of the User.
func (User) Edges() []ent.Edge {
	return []ent.Edge{
		// User creates projects
		edge.To("created_projects", Project.Type),
		// User creates packages
		edge.To("created_packages", Packages.Type),
		// User creates releases
		edge.To("created_releases", Release.Type),
		// User creates upgrade targets
		edge.To("created_upgrades", Upgrade.Type),
		edge.From("tenants", Tenant.Type).
			Ref("users"),
	}
}

// Indexes of the User.
func (User) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("username"),
		index.Fields("is_active"),
	}
}
