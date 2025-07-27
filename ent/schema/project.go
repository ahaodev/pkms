package schema

import (
	"github.com/rs/xid"
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

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
		edge.To("client_accesses", ClientAccess.Type),
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
