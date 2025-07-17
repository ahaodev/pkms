package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/rs/xid"
)

// Share holds the schema definition for the Share entity.
type Share struct {
	ent.Schema
}

// Fields of the Share.
func (Share) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").
			DefaultFunc(func() string {
				return xid.New().String()
			}),
		field.String("code").
			NotEmpty().
			Unique(),
		field.String("release_id").
			NotEmpty(),
		field.Time("start_at").
			Default(time.Now),
		field.Time("expired_at").
			Optional(),
	}
}

// Edges of the Share.
func (Share) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("release", Release.Type).
			Ref("shares").
			Field("release_id").
			Unique().
			Required(),
	}
}

// Indexes of the Share.
func (Share) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("code").Unique(),
		index.Fields("release_id"),
	}
}
