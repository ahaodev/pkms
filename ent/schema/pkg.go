package schema

import (
	"github.com/rs/xid"
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Pkg holds the schema definition for the Package entity.
// 包的基本信息，不包含具体版本
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
			MaxLen(50),
		field.String("name").
			MaxLen(255),
		field.String("description").
			Optional(),
		field.Enum("type").
			Values("android", "web", "desktop", "linux", "other"),
		field.String("icon").
			MaxLen(500).
			Optional(),
		field.Bool("is_public").
			Default(false),
		field.JSON("tags", []string{}).
			Optional(),
		field.Time("created_at").
			Default(time.Now),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
		field.String("created_by").
			MaxLen(50),
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
		// Package has many releases
		edge.To("releases", Release.Type),
		// Package has a creator
		edge.From("creator", User.Type).
			Ref("created_packages").
			Field("created_by").
			Unique().
			Required(),
	}
}

// Indexes of the Pkg.
func (Pkg) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("project_id"),
		index.Fields("type"),
		index.Fields("is_public"),
		index.Fields("created_at"),
		index.Fields("created_by"),
		// 确保项目内包名唯一
		index.Fields("project_id", "name").
			Unique(),
	}
}
