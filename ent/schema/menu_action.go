package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/rs/xid"
)

// MenuAction holds the schema definition for the MenuAction entity.
type MenuAction struct {
	ent.Schema
}

// Fields of the MenuAction.
func (MenuAction) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").
			DefaultFunc(func() string {
				return xid.New().String()
			}),
		field.String("name").
			Comment("动作名称，如'创建用户'"),
		field.String("code").
			Comment("动作代码，如'create', 'read', 'update', 'delete'"),
		field.String("resource").
			Comment("关联的API资源路径，如'/api/v1/users'"),
		field.String("method").
			Optional().
			Comment("HTTP方法，如'GET', 'POST', 'PUT', 'DELETE'"),
		field.String("permission_key").
			Comment("权限键，用于前端权限检查，如'user:create'"),
		field.Text("description").
			Optional().
			Comment("动作描述"),
		field.Bool("is_system").
			Default(false).
			Comment("是否为系统内置动作"),
		field.Time("created_at").
			Default(time.Now).
			Comment("创建时间"),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now).
			Comment("更新时间"),
	}
}

// Edges of the MenuAction.
func (MenuAction) Edges() []ent.Edge {
	return []ent.Edge{
		// 属于哪个菜单
		edge.From("menu", Menu.Type).
			Ref("actions").
			Unique().
			Required(),
	}
}

// Indexes of the MenuAction.
func (MenuAction) Indexes() []ent.Index {
	return []ent.Index{
		// 菜单内动作代码唯一
		index.Edges("menu").Fields("code").Unique(),
		// 权限键唯一索引
		index.Fields("permission_key").Unique(),
		// 按资源路径查询
		index.Fields("resource"),
		// 按方法查询
		index.Fields("method"),
	}
}
