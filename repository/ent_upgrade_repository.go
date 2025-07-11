package repository

import (
	"context"
	"pkms/domain"
	"pkms/ent"
)

type entUpgradeRepository struct {
	client *ent.Client
}

func (e entUpgradeRepository) CheckUpgrade(c context.Context, packageID string) (domain.UpgradeInfo, error) {
	//TODO implement me
	panic("implement me")
}

func (e entUpgradeRepository) GetUpgradeHistory(c context.Context, packageID string) ([]domain.UpgradeHistory, error) {
	//TODO implement me
	panic("implement me")
}

func (e entUpgradeRepository) CreateUpgradeRecord(c context.Context, history *domain.UpgradeHistory) error {
	//TODO implement me
	panic("implement me")
}

func (e entUpgradeRepository) UpdateUpgradeStatus(c context.Context, id string, status string) error {
	//TODO implement me
	panic("implement me")
}

func NewUpgradeRepository(client *ent.Client) domain.UpgradeRepository {
	return &entUpgradeRepository{
		client: client,
	}
}
