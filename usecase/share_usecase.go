package usecase

import (
	"context"
	"fmt"
	"pkms/domain"
	"pkms/pkg"
	"time"

	"github.com/rs/xid"
)

type shareUsecase struct {
	shareRepository   domain.ShareRepository
	releaseRepository domain.ReleaseRepository
	contextTimeout    time.Duration
}

// NewShareUsecase creates a new share usecase
func NewShareUsecase(shareRepo domain.ShareRepository, releaseRepo domain.ReleaseRepository, timeout time.Duration) domain.ShareUsecase {
	return &shareUsecase{
		shareRepository:   shareRepo,
		releaseRepository: releaseRepo,
		contextTimeout:    timeout,
	}
}

func (su *shareUsecase) CreateShare(c context.Context, req *domain.CreateShareRequest) (*domain.ShareResponse, error) {
	ctx, cancel := context.WithTimeout(c, su.contextTimeout)
	defer cancel()

	// Verify release exists
	release, err := su.releaseRepository.GetByID(ctx, req.ReleaseID)
	if err != nil {
		return nil, fmt.Errorf("release not found: %w", err)
	}

	// Generate unique share code
	var shareCode string
	maxRetries := 10
	for i := 0; i < maxRetries; i++ {
		shareCode = pkg.GenerateShareCode(5)
		// Check if code already exists
		_, err := su.shareRepository.GetByCode(ctx, shareCode)
		if err != nil {
			// Code doesn't exist, we can use it
			break
		}
		if i == maxRetries-1 {
			return nil, fmt.Errorf("failed to generate unique share code after %d attempts", maxRetries)
		}
	}

	// Set expiry time
	var expiredAt *time.Time
	if req.ExpiryHours > 0 {
		expiryTime := time.Now().Add(time.Duration(req.ExpiryHours) * time.Hour)
		expiredAt = &expiryTime
	}

	// Create share record
	share := &domain.Share{
		ID:        xid.New().String(),
		Code:      shareCode,
		ReleaseID: req.ReleaseID,
		StartAt:   time.Now(),
		ExpiredAt: expiredAt,
	}

	createdShare, err := su.shareRepository.Create(ctx, share)
	if err != nil {
		return nil, fmt.Errorf("failed to create share: %w", err)
	}

	// Build response using the returned share data (which might be existing share)
	response := &domain.ShareResponse{
		ID:          createdShare.ID,
		Code:        createdShare.Code,
		ShareURL:    fmt.Sprintf("/share/%s", createdShare.Code),
		ReleaseID:   req.ReleaseID,
		ExpiryHours: req.ExpiryHours,
		FileName:    release.FileName,
		Version:     release.VersionCode,
		StartAt:     createdShare.StartAt,
		ExpiredAt:   createdShare.ExpiredAt,
	}

	return response, nil
}

func (su *shareUsecase) ValidateShare(c context.Context, code string) (*domain.Share, error) {
	ctx, cancel := context.WithTimeout(c, su.contextTimeout)
	defer cancel()

	share, err := su.shareRepository.GetByCode(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("share not found: %w", err)
	}

	// Check if share has expired
	if share.ExpiredAt != nil && time.Now().After(*share.ExpiredAt) {
		return nil, fmt.Errorf("share has expired")
	}

	return share, nil
}

func (su *shareUsecase) GetAllSharesByTenant(c context.Context, tenantID string) ([]*domain.ShareListItem, error) {
	ctx, cancel := context.WithTimeout(c, su.contextTimeout)
	defer cancel()

	return su.shareRepository.GetAllByTenant(ctx, tenantID)
}

func (su *shareUsecase) GetAllSharesByTenantPaged(c context.Context, tenantID string, params domain.QueryParams) (*domain.SharePagedResult, error) {
	ctx, cancel := context.WithTimeout(c, su.contextTimeout)
	defer cancel()

	return su.shareRepository.GetAllByTenantPaged(ctx, tenantID, params)
}

func (su *shareUsecase) UpdateShareExpiry(c context.Context, id string, req *domain.UpdateShareExpiryRequest) (*domain.ShareResponse, error) {
	ctx, cancel := context.WithTimeout(c, su.contextTimeout)
	defer cancel()

	// Update share expiry
	updatedShare, err := su.shareRepository.UpdateExpiry(ctx, id, req.ExpiryHours)
	if err != nil {
		return nil, fmt.Errorf("failed to update share expiry: %w", err)
	}

	// Get release information for response
	release, err := su.releaseRepository.GetByID(ctx, updatedShare.ReleaseID)
	if err != nil {
		return nil, fmt.Errorf("release not found: %w", err)
	}

	// Build response
	response := &domain.ShareResponse{
		ID:          updatedShare.ID,
		Code:        updatedShare.Code,
		ShareURL:    fmt.Sprintf("/share/%s", updatedShare.Code),
		ReleaseID:   updatedShare.ReleaseID,
		ExpiryHours: req.ExpiryHours,
		FileName:    release.FileName,
		Version:     release.VersionCode,
		StartAt:     updatedShare.StartAt,
		ExpiredAt:   updatedShare.ExpiredAt,
	}

	return response, nil
}

func (su *shareUsecase) DeleteShare(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, su.contextTimeout)
	defer cancel()

	return su.shareRepository.DeleteByID(ctx, id)
}
