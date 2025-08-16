package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/rs/xid"
)

// Menu holds the schema definition for the Menu entity.
type Menu struct {
	ent.Schema
}

// Fields of the Menu.
func (Menu) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").
			DefaultFunc(func() string {
				return xid.New().String()
			}),
		field.String("name").
			Comment("菜单名称"),
		field.String("path").
			Optional().
			Comment("路由路径"),
		field.String("icon").
			Optional().
			Comment("菜单图标"),
		field.String("component").
			Optional().
			Comment("关联的前端组件"),
		field.Int("sort").
			Default(0).
			Comment("排序权重"),
		field.Bool("visible").
			Default(true).
			Comment("是否可见"),
		field.Bool("is_system").
			Default(false).
			Comment("是否为系统内置菜单"),
		field.String("tenant_id").
			Optional().
			Comment("租户ID，为空表示系统全局菜单"),
		field.Text("description").
			Optional().
			Comment("菜单描述"),
		field.Time("created_at").
			Default(time.Now).
			Comment("创建时间"),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now).
			Comment("更新时间"),
	}
}

// Edges of the Menu.
func (Menu) Edges() []ent.Edge {
	return []ent.Edge{
		// 父子关系：一个菜单可以有多个子菜单
		edge.To("children", Menu.Type).
			From("parent").
			Unique(),
		// 菜单的动作权限
		edge.To("actions", MenuAction.Type),
		// 角色菜单关联（多对多）
		edge.From("roles", Role.Type).
			Ref("menus"),
	}
}

// Indexes of the Menu.
func (Menu) Indexes() []ent.Index {
	return []ent.Index{
		// 租户内菜单名称唯一
		index.Fields("tenant_id", "name").Unique(),
		// 按租户和排序查询
		index.Fields("tenant_id", "sort"),
		// 按可见性查询
		index.Fields("visible"),
		// 按路径查询
		index.Fields("path"),
	}
}
