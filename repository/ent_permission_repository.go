package repository

import (
	"context"

	"pkms/domain"
	"pkms/ent"
	"pkms/ent/grouppermission"
	"pkms/ent/projectpermission"
)

type entPermissionRepository struct {
	client *ent.Client
}

func NewPermissionRepository(client *ent.Client) domain.PermissionRepository {
	return &entPermissionRepository{
		client: client,
	}
}

func (pr *entPermissionRepository) CreateUserPermission(c context.Context, permission *domain.Permission) error {
	// Generate a unique ID if not provided
	if permission.ID == "" {
		permission.ID = generateUniqueID()
	}

	_, err := pr.client.ProjectPermission.
		Create().
		SetID(permission.ID).
		SetUserID(permission.UserID).
		SetProjectID(permission.ProjectID).
		SetCanView(permission.CanView).
		SetCanEdit(permission.CanEdit).
		Save(c)

	return err
}

func (pr *entPermissionRepository) CreateGroupPermission(c context.Context, permission *domain.GroupPermission) error {
	// Generate a unique ID if not provided
	if permission.ID == "" {
		permission.ID = generateUniqueID()
	}

	_, err := pr.client.GroupPermission.
		Create().
		SetID(permission.ID).
		SetGroupID(permission.GroupID).
		SetProjectID(permission.ProjectID).
		SetCanView(permission.CanView).
		SetCanEdit(permission.CanEdit).
		Save(c)

	return err
}

func (pr *entPermissionRepository) GetUserPermissions(c context.Context, userID string) ([]domain.Permission, error) {
	permissions, err := pr.client.ProjectPermission.
		Query().
		Where(projectpermission.UserID(userID)).
		All(c)

	if err != nil {
		return nil, err
	}

	var result []domain.Permission
	for _, p := range permissions {
		result = append(result, domain.Permission{
			ID:        p.ID,
			UserID:    p.UserID,
			ProjectID: p.ProjectID,
			CanView:   p.CanView,
			CanEdit:   p.CanEdit,
			CanDelete: false, // Default to false since not supported in ent
			CanManage: false, // Default to false since not supported in ent
		})
	}

	return result, nil
}

func (pr *entPermissionRepository) GetGroupPermissions(c context.Context, groupID string) ([]domain.GroupPermission, error) {
	permissions, err := pr.client.GroupPermission.
		Query().
		Where(grouppermission.GroupID(groupID)).
		All(c)

	if err != nil {
		return nil, err
	}

	var result []domain.GroupPermission
	for _, p := range permissions {
		result = append(result, domain.GroupPermission{
			ID:        p.ID,
			GroupID:   p.GroupID,
			ProjectID: p.ProjectID,
			CanView:   p.CanView,
			CanEdit:   p.CanEdit,
			CanDelete: false, // Default to false since not supported in ent
			CanManage: false, // Default to false since not supported in ent
		})
	}

	return result, nil
}

func (pr *entPermissionRepository) GetProjectPermissions(c context.Context, projectID string) ([]domain.Permission, error) {
	permissions, err := pr.client.ProjectPermission.
		Query().
		Where(projectpermission.ProjectID(projectID)).
		All(c)

	if err != nil {
		return nil, err
	}

	var result []domain.Permission
	for _, p := range permissions {
		result = append(result, domain.Permission{
			ID:        p.ID,
			UserID:    p.UserID,
			ProjectID: p.ProjectID,
			CanView:   p.CanView,
			CanEdit:   p.CanEdit,
			CanDelete: false, // Default to false since not supported in ent
			CanManage: false, // Default to false since not supported in ent
		})
	}

	return result, nil
}

func (pr *entPermissionRepository) UpdateUserPermission(c context.Context, permission *domain.Permission) error {
	_, err := pr.client.ProjectPermission.
		UpdateOneID(permission.ID).
		SetCanView(permission.CanView).
		SetCanEdit(permission.CanEdit).
		Save(c)

	return err
}

func (pr *entPermissionRepository) UpdateGroupPermission(c context.Context, permission *domain.GroupPermission) error {
	_, err := pr.client.GroupPermission.
		UpdateOneID(permission.ID).
		SetCanView(permission.CanView).
		SetCanEdit(permission.CanEdit).
		Save(c)

	return err
}

func (pr *entPermissionRepository) DeleteUserPermission(c context.Context, userID, projectID string) error {
	_, err := pr.client.ProjectPermission.
		Delete().
		Where(
			projectpermission.UserID(userID),
			projectpermission.ProjectID(projectID),
		).
		Exec(c)

	return err
}

func (pr *entPermissionRepository) DeleteGroupPermission(c context.Context, groupID, projectID string) error {
	_, err := pr.client.GroupPermission.
		Delete().
		Where(
			grouppermission.GroupID(groupID),
			grouppermission.ProjectID(projectID),
		).
		Exec(c)

	return err
}

func (pr *entPermissionRepository) CheckUserPermission(c context.Context, userID, projectID string) (domain.Permission, error) {
	p, err := pr.client.ProjectPermission.
		Query().
		Where(
			projectpermission.UserID(userID),
			projectpermission.ProjectID(projectID),
		).
		First(c)

	if err != nil {
		return domain.Permission{}, err
	}

	return domain.Permission{
		ID:        p.ID,
		UserID:    p.UserID,
		ProjectID: p.ProjectID,
		CanView:   p.CanView,
		CanEdit:   p.CanEdit,
		CanDelete: false, // Default to false since not supported in ent
		CanManage: false, // Default to false since not supported in ent
	}, nil
}
