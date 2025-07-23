package repository

import (
	"context"
	"pkms/domain"
	"pkms/ent"
	"pkms/ent/share"
	"time"
)

type entShareRepository struct {
	database *ent.Client
}

// NewShareRepository creates a new share repository
func NewShareRepository(database *ent.Client) domain.ShareRepository {
	return &entShareRepository{
		database: database,
	}
}

func (esr *entShareRepository) Create(c context.Context, shareData *domain.Share) error {
	_, err := esr.database.Share.Create().
		SetID(shareData.ID).
		SetCode(shareData.Code).
		SetReleaseID(shareData.ReleaseID).
		SetStartAt(shareData.StartAt).
		SetNillableExpiredAt(shareData.ExpiredAt).
		Save(c)
	return err
}

func (esr *entShareRepository) GetByCode(c context.Context, code string) (*domain.Share, error) {
	shareEntity, err := esr.database.Share.Query().
		Where(share.Code(code)).
		Only(c)
	if err != nil {
		return nil, err
	}

	return &domain.Share{
		ID:        shareEntity.ID,
		Code:      shareEntity.Code,
		ReleaseID: shareEntity.ReleaseID,
		StartAt:   shareEntity.StartAt,
		ExpiredAt: shareEntity.ExpiredAt,
	}, nil
}

func (esr *entShareRepository) GetByReleaseID(c context.Context, releaseID string) ([]*domain.Share, error) {
	shares, err := esr.database.Share.Query().
		Where(share.ReleaseID(releaseID)).
		All(c)
	if err != nil {
		return nil, err
	}

	result := make([]*domain.Share, len(shares))
	for i, s := range shares {
		result[i] = &domain.Share{
			ID:        s.ID,
			Code:      s.Code,
			ReleaseID: s.ReleaseID,
			StartAt:   s.StartAt,
			ExpiredAt: s.ExpiredAt,
		}
	}
	return result, nil
}

func (esr *entShareRepository) DeleteExpired(c context.Context) error {
	_, err := esr.database.Share.Delete().
		Where(share.ExpiredAtLT(time.Now())).
		Exec(c)
	return err
}
