package repository

import (
	"context"
	"pkms/domain"
	"pkms/ent"
	"pkms/ent/packages"
	"pkms/ent/project"
	"pkms/ent/release"
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

func (esr *entShareRepository) Create(c context.Context, shareData *domain.Share) (*domain.Share, error) {
	// 首先查询该 ReleaseID 是否已存在分享
	existingShare, err := esr.database.Share.Query().
		Where(share.ReleaseID(shareData.ReleaseID)).
		First(c)

	// 如果查询出错且不是 NotFound 错误，返回错误
	if err != nil && !ent.IsNotFound(err) {
		return nil, err
	}

	// 如果存在，返回现有的分享记录
	if existingShare != nil {
		var expiredAt *time.Time
		if !existingShare.ExpiredAt.IsZero() {
			expiredAt = &existingShare.ExpiredAt
		}

		return &domain.Share{
			ID:        existingShare.ID,
			Code:      existingShare.Code,
			ReleaseID: existingShare.ReleaseID,
			StartAt:   existingShare.StartAt,
			ExpiredAt: expiredAt,
		}, nil
	}

	// 如果不存在，创建新的分享记录
	newShare, err := esr.database.Share.Create().
		SetID(shareData.ID).
		SetCode(shareData.Code).
		SetReleaseID(shareData.ReleaseID).
		SetStartAt(shareData.StartAt).
		SetNillableExpiredAt(shareData.ExpiredAt).
		Save(c)
	if err != nil {
		return nil, err
	}

	var expiredAt *time.Time
	if shareData.ExpiredAt != nil {
		expiredAt = shareData.ExpiredAt
	}

	return &domain.Share{
		ID:        newShare.ID,
		Code:      newShare.Code,
		ReleaseID: newShare.ReleaseID,
		StartAt:   newShare.StartAt,
		ExpiredAt: expiredAt,
	}, nil
}

func (esr *entShareRepository) GetByCode(c context.Context, code string) (*domain.Share, error) {
	shareEntity, err := esr.database.Share.Query().
		Where(share.Code(code)).
		Only(c)
	if err != nil {
		return nil, err
	}

	var expiredAt *time.Time
	if !shareEntity.ExpiredAt.IsZero() {
		expiredAt = &shareEntity.ExpiredAt
	}

	return &domain.Share{
		ID:        shareEntity.ID,
		Code:      shareEntity.Code,
		ReleaseID: shareEntity.ReleaseID,
		StartAt:   shareEntity.StartAt,
		ExpiredAt: expiredAt,
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
		var expiredAt *time.Time
		if !s.ExpiredAt.IsZero() {
			expiredAt = &s.ExpiredAt
		}

		result[i] = &domain.Share{
			ID:        s.ID,
			Code:      s.Code,
			ReleaseID: s.ReleaseID,
			StartAt:   s.StartAt,
			ExpiredAt: expiredAt,
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

func (esr *entShareRepository) GetAllByTenant(c context.Context, tenantID string) ([]*domain.ShareListItem, error) {
	shares, err := esr.database.Share.Query().
		WithRelease(func(rq *ent.ReleaseQuery) {
			rq.WithPackage(func(pq *ent.PackagesQuery) {
				pq.WithProject()
			})
		}).
		Where(
			share.HasReleaseWith(
				release.HasPackageWith(
					packages.HasProjectWith(
						project.TenantID(tenantID),
					),
				),
			),
		).
		Order(ent.Desc(share.FieldStartAt)).
		All(c)

	if err != nil {
		return nil, err
	}

	result := make([]*domain.ShareListItem, len(shares))
	for i, s := range shares {
		rel := s.Edges.Release
		pkg := rel.Edges.Package
		proj := pkg.Edges.Project

		isExpired := false
		if !s.ExpiredAt.IsZero() && s.ExpiredAt.Before(time.Now()) {
			isExpired = true
		}

		var expiredAt *time.Time
		if !s.ExpiredAt.IsZero() {
			expiredAt = &s.ExpiredAt
		}

		result[i] = &domain.ShareListItem{
			ID:          s.ID,
			Code:        s.Code,
			ProjectName: proj.Name,
			PackageName: pkg.Name,
			Version:     rel.VersionCode,
			FileName:    rel.FileName,
			ShareURL:    "/share/" + s.Code,
			StartAt:     s.StartAt,
			ExpiredAt:   expiredAt,
			IsExpired:   isExpired,
		}
	}
	return result, nil
}

func (esr *entShareRepository) GetAllByTenantPaged(c context.Context, tenantID string, params domain.QueryParams) (*domain.SharePagedResult, error) {
	// 计算总数
	total, err := esr.database.Share.Query().
		Where(
			share.HasReleaseWith(
				release.HasPackageWith(
					packages.HasProjectWith(
						project.TenantID(tenantID),
					),
				),
			),
		).
		Count(c)
	if err != nil {
		return nil, err
	}

	// 计算分页参数
	offset := (params.Page - 1) * params.PageSize

	// 查询分页数据
	shares, err := esr.database.Share.Query().
		WithRelease(func(rq *ent.ReleaseQuery) {
			rq.WithPackage(func(pq *ent.PackagesQuery) {
				pq.WithProject()
			})
		}).
		Where(
			share.HasReleaseWith(
				release.HasPackageWith(
					packages.HasProjectWith(
						project.TenantID(tenantID),
					),
				),
			),
		).
		Order(ent.Desc(share.FieldStartAt)).
		Offset(offset).
		Limit(params.PageSize).
		All(c)

	if err != nil {
		return nil, err
	}

	// 转换为 domain 对象
	result := make([]*domain.ShareListItem, len(shares))
	for i, s := range shares {
		rel := s.Edges.Release
		pkg := rel.Edges.Package
		proj := pkg.Edges.Project

		isExpired := false
		if !s.ExpiredAt.IsZero() && s.ExpiredAt.Before(time.Now()) {
			isExpired = true
		}

		var expiredAt *time.Time
		if !s.ExpiredAt.IsZero() {
			expiredAt = &s.ExpiredAt
		}

		result[i] = &domain.ShareListItem{
			ID:          s.ID,
			Code:        s.Code,
			ProjectName: proj.Name,
			PackageName: pkg.Name,
			Version:     rel.VersionCode,
			FileName:    rel.FileName,
			ShareURL:    "/share/" + s.Code,
			StartAt:     s.StartAt,
			ExpiredAt:   expiredAt,
			IsExpired:   isExpired,
		}
	}

	return domain.NewPagedResult(result, total, params.Page, params.PageSize), nil
}

func (esr *entShareRepository) UpdateExpiry(c context.Context, id string, expiryHours int) (*domain.Share, error) {
	// Create the update builder
	updateBuilder := esr.database.Share.UpdateOneID(id)

	// Set expiry time based on hours
	if expiryHours > 0 {
		expiryTime := time.Now().Add(time.Duration(expiryHours) * time.Hour)
		updateBuilder = updateBuilder.SetExpiredAt(expiryTime)
	} else {
		// For permanent shares (expiryHours <= 0), clear the expiry date
		updateBuilder = updateBuilder.ClearExpiredAt()
	}

	shareEntity, err := updateBuilder.Save(c)
	if err != nil {
		return nil, err
	}

	var resultExpiredAt *time.Time
	if !shareEntity.ExpiredAt.IsZero() {
		resultExpiredAt = &shareEntity.ExpiredAt
	}

	return &domain.Share{
		ID:        shareEntity.ID,
		Code:      shareEntity.Code,
		ReleaseID: shareEntity.ReleaseID,
		StartAt:   shareEntity.StartAt,
		ExpiredAt: resultExpiredAt,
	}, nil
}

func (esr *entShareRepository) DeleteByID(c context.Context, id string) error {
	return esr.database.Share.DeleteOneID(id).Exec(c)
}
