package usecase

import (
	"context"
	"time"

	"pkms/domain"
)

type groupUsecase struct {
	groupRepository domain.GroupRepository
	contextTimeout  time.Duration
}

func NewGroupUsecase(groupRepository domain.GroupRepository, timeout time.Duration) domain.GroupUsecase {
	return &groupUsecase{
		groupRepository: groupRepository,
		contextTimeout:  timeout,
	}
}

func (gu *groupUsecase) Create(c context.Context, group *domain.Group) error {
	ctx, cancel := context.WithTimeout(c, gu.contextTimeout)
	defer cancel()
	return gu.groupRepository.Create(ctx, group)
}

func (gu *groupUsecase) Fetch(c context.Context) ([]domain.Group, error) {
	ctx, cancel := context.WithTimeout(c, gu.contextTimeout)
	defer cancel()
	return gu.groupRepository.Fetch(ctx)
}

func (gu *groupUsecase) GetByID(c context.Context, id string) (domain.Group, error) {
	ctx, cancel := context.WithTimeout(c, gu.contextTimeout)
	defer cancel()
	return gu.groupRepository.GetByID(ctx, id)
}

func (gu *groupUsecase) Update(c context.Context, group *domain.Group) error {
	ctx, cancel := context.WithTimeout(c, gu.contextTimeout)
	defer cancel()
	return gu.groupRepository.Update(ctx, group)
}

func (gu *groupUsecase) Delete(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, gu.contextTimeout)
	defer cancel()
	return gu.groupRepository.Delete(ctx, id)
}

func (gu *groupUsecase) GetByUserID(c context.Context, userID string) ([]domain.Group, error) {
	ctx, cancel := context.WithTimeout(c, gu.contextTimeout)
	defer cancel()
	return gu.groupRepository.GetByUserID(ctx, userID)
}

func (gu *groupUsecase) AddMember(c context.Context, membership *domain.GroupMembership) error {
	ctx, cancel := context.WithTimeout(c, gu.contextTimeout)
	defer cancel()
	return gu.groupRepository.AddMember(ctx, membership)
}

func (gu *groupUsecase) RemoveMember(c context.Context, userID, groupID string) error {
	ctx, cancel := context.WithTimeout(c, gu.contextTimeout)
	defer cancel()
	return gu.groupRepository.RemoveMember(ctx, userID, groupID)
}

func (gu *groupUsecase) GetMembers(c context.Context, groupID string) ([]domain.User, error) {
	ctx, cancel := context.WithTimeout(c, gu.contextTimeout)
	defer cancel()
	return gu.groupRepository.GetMembers(ctx, groupID)
}
