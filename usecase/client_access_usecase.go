package usecase

import (
	"context"
	"errors"
	"fmt"
	"pkms/pkg"
	"time"

	"pkms/domain"
)

type clientAccessUsecase struct {
	clientAccessRepository domain.ClientAccessRepository
	projectRepository      domain.ProjectRepository
	packageRepository      domain.PackageRepository
	contextTimeout         time.Duration
}

func NewClientAccessUsecase(
	clientAccessRepository domain.ClientAccessRepository,
	projectRepository domain.ProjectRepository,
	packageRepository domain.PackageRepository,
	timeout time.Duration,
) domain.ClientAccessUsecase {
	return &clientAccessUsecase{
		clientAccessRepository: clientAccessRepository,
		projectRepository:      projectRepository,
		packageRepository:      packageRepository,
		contextTimeout:         timeout,
	}
}

// generateAccessToken 生成16字节的随机访问令牌

func (u *clientAccessUsecase) Create(ctx context.Context, request *domain.CreateClientAccessRequest, userID, tenantID string) (*domain.ClientAccess, error) {
	c, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	// 验证项目是否存在
	_, err := u.projectRepository.GetByID(c, request.ProjectID)
	if err != nil {
		return nil, fmt.Errorf("项目不存在: %w", err)
	}

	// 验证包是否存在
	_, err = u.packageRepository.GetByID(c, request.PackageID)
	if err != nil {
		return nil, fmt.Errorf("软件包不存在: %w", err)
	}

	// 创建客户端接入凭证
	access := &domain.ClientAccess{
		TenantID:    tenantID,
		ProjectID:   request.ProjectID,
		PackageID:   request.PackageID,
		AccessToken: pkg.GenerateAccessToken(),
		Name:        request.Name,
		Description: request.Description,
		IsActive:    true,
		UsageCount:  0,
		CreatedBy:   userID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if request.ExpiresAt != nil {
		access.ExpiresAt = request.ExpiresAt
	}

	err = u.clientAccessRepository.Create(c, access)
	if err != nil {
		return nil, fmt.Errorf("创建客户端接入凭证失败: %w", err)
	}

	// 返回完整信息
	return u.clientAccessRepository.GetByID(c, access.ID)
}

func (u *clientAccessUsecase) GetList(ctx context.Context, tenantID string, filters map[string]interface{}, queryParams *domain.QueryParams) (*domain.PagedResult[*domain.ClientAccess], error) {
	c, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.clientAccessRepository.GetList(c, tenantID, filters, queryParams)
}

func (u *clientAccessUsecase) GetByID(ctx context.Context, id string) (*domain.ClientAccess, error) {
	c, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.clientAccessRepository.GetByID(c, id)
}

func (u *clientAccessUsecase) Update(ctx context.Context, id string, request *domain.UpdateClientAccessRequest) error {
	c, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	// 检查客户端接入凭证是否存在
	_, err := u.clientAccessRepository.GetByID(c, id)
	if err != nil {
		return fmt.Errorf("客户端接入凭证不存在: %w", err)
	}

	// 构建更新映射
	updates := make(map[string]interface{})
	if request.Name != "" {
		updates["name"] = request.Name
	}
	if request.Description != "" {
		updates["description"] = request.Description
	}
	if request.IsActive != nil {
		updates["is_active"] = *request.IsActive
	}
	if request.ExpiresAt != nil {
		updates["expires_at"] = request.ExpiresAt
	}

	return u.clientAccessRepository.Update(c, id, updates)
}

func (u *clientAccessUsecase) Delete(ctx context.Context, id string) error {
	c, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	// 检查客户端接入凭证是否存在
	_, err := u.clientAccessRepository.GetByID(c, id)
	if err != nil {
		return fmt.Errorf("客户端接入凭证不存在: %w", err)
	}

	return u.clientAccessRepository.Delete(c, id)
}

func (u *clientAccessUsecase) ValidateAccessToken(ctx context.Context, token string) (*domain.ClientAccess, error) {
	c, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	if token == "" {
		return nil, errors.New("访问令牌不能为空")
	}

	// 根据token查找客户端接入凭证
	access, err := u.clientAccessRepository.GetByAccessToken(c, token)
	if err != nil {
		return nil, fmt.Errorf("无效的访问令牌: %w", err)
	}

	// 检查是否激活
	if !access.IsActive {
		return nil, errors.New("客户端接入凭证已被禁用")
	}

	// 检查是否过期
	if access.ExpiresAt != nil && access.ExpiresAt.Before(time.Now()) {
		return nil, errors.New("客户端接入凭证已过期")
	}

	return access, nil
}

func (u *clientAccessUsecase) RegenerateToken(ctx context.Context, id string) (string, error) {
	c, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	// 检查客户端接入凭证是否存在
	_, err := u.clientAccessRepository.GetByID(c, id)
	if err != nil {
		return "", fmt.Errorf("客户端接入凭证不存在: %w", err)
	}

	// 生成新的访问令牌
	newToken := pkg.GenerateAccessToken()

	// 更新令牌
	updates := map[string]interface{}{
		"access_token": newToken,
	}

	err = u.clientAccessRepository.Update(c, id, updates)
	if err != nil {
		return "", fmt.Errorf("重新生成访问令牌失败: %w", err)
	}

	return newToken, nil
}
