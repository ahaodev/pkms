package usecase

import (
	"context"
	"fmt"
	"math/rand"
	"pkms/domain"
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

// generateShareCode generates a 5-digit random code
func generateShareCode() string {
	// Generate a 5-digit number (10000-99999)
	code := rand.Intn(90000) + 10000
	return fmt.Sprintf("%d", code)
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
		shareCode = generateShareCode()
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

	err = su.shareRepository.Create(ctx, share)
	if err != nil {
		return nil, fmt.Errorf("failed to create share: %w", err)
	}

	// Build response
	response := &domain.ShareResponse{
		ID:          share.ID,
		Code:        share.Code,
		ShareURL:    fmt.Sprintf("/share/%s", share.Code),
		ReleaseID:   req.ReleaseID,
		ExpiryHours: req.ExpiryHours,
		FileName:    release.FileName,
		Version:     release.Version,
		StartAt:     share.StartAt,
		ExpiredAt:   share.ExpiredAt,
	}

	return response, nil
}

func (su *shareUsecase) GetShareByCode(c context.Context, code string) (*domain.Share, error) {
	ctx, cancel := context.WithTimeout(c, su.contextTimeout)
	defer cancel()

	return su.shareRepository.GetByCode(ctx, code)
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