package schema

import (
	"github.com/rs/xid"
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

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
		// User creates client accesses
		edge.To("created_client_accesses", ClientAccess.Type),
		// User belongs to tenants
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
