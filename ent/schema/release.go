package schema

import (
	"github.com/rs/xid"
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Release holds the schema definition for the Release entity.
type Release struct {
	ent.Schema
}

// Fields of the Release.
func (Release) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").
			DefaultFunc(func() string {
				return xid.New().String()
			}),
		field.String("package_id"),
		field.String("version").
			MaxLen(100),
		field.String("tag_name").
			MaxLen(100).
			Optional(),
		field.String("title").
			MaxLen(255).
			Optional(),
		field.String("changelog").
			Optional(), // Release notes/changelog
		field.String("file_path").
			MaxLen(500),
		field.String("file_name").
			MaxLen(255),
		field.Int64("file_size"),
		field.String("file_hash").
			MaxLen(64).
			Optional(),
		field.Int("download_count").
			Default(0),
		field.String("created_by").
			MaxLen(50),
		field.Time("created_at").
			Default(time.Now),
	}
}

// Edges of the Release.
func (Release) Edges() []ent.Edge {
	return []ent.Edge{
		// Release belongs to a package
		edge.From("package", Packages.Type).
			Ref("releases").
			Field("package_id").
			Unique().
			Required(),
		// Release has a creator
		edge.From("creator", User.Type).
			Ref("created_releases").
			Field("created_by").
			Unique().
			Required(),
		edge.To("shares", Share.Type),
		// Release has upgrade targets
		edge.To("upgrades", Upgrade.Type),
	}
}

// Indexes of the Release.
func (Release) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("package_id"),
		index.Fields("version"),
		index.Fields("created_at"),
		// Unique constraint: one version per package
		index.Fields("package_id", "version").Unique(),
		// Unique constraint: one tag per package (if provided)
		index.Fields("package_id", "tag_name").Unique(),
	}
}
