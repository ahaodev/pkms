package repository

import (
	"context"

	"pkms/domain"
	"pkms/ent"
	"pkms/ent/group"
	"pkms/ent/groupmembership"
)

type entGroupRepository struct {
	client *ent.Client
}

func NewGroupRepository(client *ent.Client) domain.GroupRepository {
	return &entGroupRepository{
		client: client,
	}
}

func (gr *entGroupRepository) Create(c context.Context, g *domain.Group) error {
	// Generate a unique ID if not provided
	if g.ID == "" {
		g.ID = generateUniqueID()
	}

	created, err := gr.client.Group.
		Create().
		SetID(g.ID).
		SetName(g.Name).
		SetDescription(g.Description).
		SetColor(g.Color).
		SetCreatedBy(g.CreatedBy).
		SetMemberCount(g.MemberCount).
		Save(c)

	if err != nil {
		return err
	}

	g.ID = created.ID
	g.CreatedAt = created.CreatedAt
	g.UpdatedAt = created.UpdatedAt
	return nil
}

func (gr *entGroupRepository) Fetch(c context.Context) ([]domain.Group, error) {
	groups, err := gr.client.Group.
		Query().
		All(c)

	if err != nil {
		return nil, err
	}

	var result []domain.Group
	for _, g := range groups {
		result = append(result, domain.Group{
			ID:          g.ID,
			Name:        g.Name,
			Description: g.Description,
			Color:       g.Color,
			CreatedAt:   g.CreatedAt,
			UpdatedAt:   g.UpdatedAt,
			MemberCount: g.MemberCount,
			CreatedBy:   g.CreatedBy,
		})
	}

	return result, nil
}

func (gr *entGroupRepository) GetByID(c context.Context, id string) (domain.Group, error) {
	g, err := gr.client.Group.
		Query().
		Where(group.ID(id)).
		First(c)

	if err != nil {
		return domain.Group{}, err
	}

	return domain.Group{
		ID:          g.ID,
		Name:        g.Name,
		Description: g.Description,
		Color:       g.Color,
		CreatedAt:   g.CreatedAt,
		UpdatedAt:   g.UpdatedAt,
		MemberCount: g.MemberCount,
		CreatedBy:   g.CreatedBy,
	}, nil
}

func (gr *entGroupRepository) Update(c context.Context, g *domain.Group) error {
	_, err := gr.client.Group.
		UpdateOneID(g.ID).
		SetName(g.Name).
		SetDescription(g.Description).
		SetColor(g.Color).
		SetMemberCount(g.MemberCount).
		Save(c)

	return err
}

func (gr *entGroupRepository) Delete(c context.Context, id string) error {
	return gr.client.Group.
		DeleteOneID(id).
		Exec(c)
}

func (gr *entGroupRepository) GetByUserID(c context.Context, userID string) ([]domain.Group, error) {
	memberships, err := gr.client.GroupMembership.
		Query().
		Where(groupmembership.UserID(userID)).
		WithGroup().
		All(c)

	if err != nil {
		return nil, err
	}

	var result []domain.Group
	for _, m := range memberships {
		if m.Edges.Group != nil {
			g := m.Edges.Group
			result = append(result, domain.Group{
				ID:          g.ID,
				Name:        g.Name,
				Description: g.Description,
				Color:       g.Color,
				CreatedAt:   g.CreatedAt,
				UpdatedAt:   g.UpdatedAt,
				MemberCount: g.MemberCount,
				CreatedBy:   g.CreatedBy,
			})
		}
	}

	return result, nil
}

func (gr *entGroupRepository) AddMember(c context.Context, membership *domain.GroupMembership) error {
	_, err := gr.client.GroupMembership.
		Create().
		SetUserID(membership.UserID).
		SetGroupID(membership.GroupID).
		SetAddedBy(membership.AddedBy).
		Save(c)

	return err
}

func (gr *entGroupRepository) RemoveMember(c context.Context, userID, groupID string) error {
	_, err := gr.client.GroupMembership.
		Delete().
		Where(
			groupmembership.UserID(userID),
			groupmembership.GroupID(groupID),
		).
		Exec(c)

	return err
}

func (gr *entGroupRepository) GetMembers(c context.Context, groupID string) ([]domain.User, error) {
	memberships, err := gr.client.GroupMembership.
		Query().
		Where(groupmembership.GroupID(groupID)).
		WithUser().
		All(c)

	if err != nil {
		return nil, err
	}

	var result []domain.User
	for _, m := range memberships {
		if m.Edges.User != nil {
			u := m.Edges.User
			result = append(result, domain.User{
				ID:        u.ID,
				Name:      u.Username,
				CreatedAt: u.CreatedAt,
				UpdatedAt: u.UpdatedAt,
			})
		}
	}

	return result, nil
}
