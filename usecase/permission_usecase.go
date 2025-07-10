package usecase

import (
	"context"
	"time"

	"pkms/domain"
)

type permissionUsecase struct {
	permissionRepository domain.PermissionRepository
	contextTimeout       time.Duration
}

func NewPermissionUsecase(permissionRepository domain.PermissionRepository, timeout time.Duration) domain.PermissionUsecase {
	return &permissionUsecase{
		permissionRepository: permissionRepository,
		contextTimeout:       timeout,
	}
}

func (pu *permissionUsecase) CreateUserPermission(c context.Context, permission *domain.Permission) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.permissionRepository.CreateUserPermission(ctx, permission)
}

func (pu *permissionUsecase) CreateGroupPermission(c context.Context, permission *domain.GroupPermission) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.permissionRepository.CreateGroupPermission(ctx, permission)
}

func (pu *permissionUsecase) GetUserPermissions(c context.Context, userID string) ([]domain.Permission, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.permissionRepository.GetUserPermissions(ctx, userID)
}

func (pu *permissionUsecase) GetGroupPermissions(c context.Context, groupID string) ([]domain.GroupPermission, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.permissionRepository.GetGroupPermissions(ctx, groupID)
}

func (pu *permissionUsecase) GetProjectPermissions(c context.Context, projectID string) ([]domain.Permission, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.permissionRepository.GetProjectPermissions(ctx, projectID)
}

func (pu *permissionUsecase) UpdateUserPermission(c context.Context, permission *domain.Permission) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.permissionRepository.UpdateUserPermission(ctx, permission)
}

func (pu *permissionUsecase) UpdateGroupPermission(c context.Context, permission *domain.GroupPermission) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.permissionRepository.UpdateGroupPermission(ctx, permission)
}

func (pu *permissionUsecase) DeleteUserPermission(c context.Context, userID, projectID string) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.permissionRepository.DeleteUserPermission(ctx, userID, projectID)
}

func (pu *permissionUsecase) DeleteGroupPermission(c context.Context, groupID, projectID string) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.permissionRepository.DeleteGroupPermission(ctx, groupID, projectID)
}

func (pu *permissionUsecase) CheckUserPermission(c context.Context, userID, projectID string) (domain.Permission, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.permissionRepository.CheckUserPermission(ctx, userID, projectID)
}

func (pu *permissionUsecase) HasPermission(c context.Context, userID, projectID string, action string) (bool, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()

	permission, err := pu.permissionRepository.CheckUserPermission(ctx, userID, projectID)
	if err != nil {
		return false, err
	}

	switch action {
	case "view":
		return permission.CanView, nil
	case "edit":
		return permission.CanEdit, nil
	case "delete":
		return permission.CanDelete, nil
	case "manage":
		return permission.CanManage, nil
	default:
		return false, nil
	}
}
