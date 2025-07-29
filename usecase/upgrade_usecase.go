package usecase

import (
	"context"
	"errors"
	"fmt"
	"time"

	"pkms/domain"
)

type upgradeUsecase struct {
	upgradeRepository      domain.UpgradeRepository
	projectRepository      domain.ProjectRepository
	packageRepository      domain.PackageRepository
	releaseRepository      domain.ReleaseRepository
	clientAccessRepository domain.ClientAccessRepository
	contextTimeout         time.Duration
}

func NewUpgradeUsecase(
	upgradeRepository domain.UpgradeRepository,
	projectRepository domain.ProjectRepository,
	packageRepository domain.PackageRepository,
	releaseRepository domain.ReleaseRepository,
	timeout time.Duration,
) domain.UpgradeUsecase {
	return &upgradeUsecase{
		upgradeRepository: upgradeRepository,
		projectRepository: projectRepository,
		packageRepository: packageRepository,
		releaseRepository: releaseRepository,
		contextTimeout:    timeout,
	}
}

func NewUpgradeUsecaseWithClientAccess(
	upgradeRepository domain.UpgradeRepository,
	projectRepository domain.ProjectRepository,
	packageRepository domain.PackageRepository,
	releaseRepository domain.ReleaseRepository,
	clientAccessRepository domain.ClientAccessRepository,
	timeout time.Duration,
) domain.UpgradeUsecase {
	return &upgradeUsecase{
		upgradeRepository:      upgradeRepository,
		projectRepository:      projectRepository,
		packageRepository:      packageRepository,
		releaseRepository:      releaseRepository,
		clientAccessRepository: clientAccessRepository,
		contextTimeout:         timeout,
	}
}

func (u *upgradeUsecase) CreateUpgradeTarget(ctx context.Context, request *domain.CreateUpgradeTargetRequest, userID, tenantID string) (*domain.UpgradeTarget, error) {
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

	// 验证版本是否存在
	_, err = u.releaseRepository.GetByID(c, request.ReleaseID)
	if err != nil {
		return nil, fmt.Errorf("版本不存在: %w", err)
	}

	// 检查是否已有该包的激活升级目标
	existing, err := u.upgradeRepository.GetActiveUpgradeTargetByPackageID(c, request.PackageID)
	if err == nil && existing != nil {
		return nil, errors.New("该软件包已有激活的升级目标，请先禁用现有目标")
	}

	// 创建升级目标
	upgradeTarget := &domain.UpgradeTarget{
		TenantID:    tenantID,
		ProjectID:   request.ProjectID,
		PackageID:   request.PackageID,
		ReleaseID:   request.ReleaseID,
		Name:        request.Name,
		Description: request.Description,
		IsActive:    true,
		CreatedBy:   userID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	err = u.upgradeRepository.CreateUpgradeTarget(c, upgradeTarget)
	if err != nil {
		return nil, fmt.Errorf("创建升级目标失败: %w", err)
	}

	// 返回完整信息
	return u.upgradeRepository.GetUpgradeTargetByID(c, upgradeTarget.ID)
}

func (u *upgradeUsecase) GetUpgradeTargets(ctx context.Context, tenantID string, filters map[string]interface{}) ([]*domain.UpgradeTarget, error) {
	c, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.upgradeRepository.GetUpgradeTargets(c, tenantID, filters)
}

func (u *upgradeUsecase) GetUpgradeTargetByID(ctx context.Context, id string) (*domain.UpgradeTarget, error) {
	c, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.upgradeRepository.GetUpgradeTargetByID(c, id)
}

func (u *upgradeUsecase) UpdateUpgradeTarget(ctx context.Context, id string, request *domain.UpdateUpgradeTargetRequest) error {
	c, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	// 检查升级目标是否存在
	_, err := u.upgradeRepository.GetUpgradeTargetByID(c, id)
	if err != nil {
		return fmt.Errorf("升级目标不存在: %w", err)
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

	return u.upgradeRepository.UpdateUpgradeTarget(c, id, updates)
}

func (u *upgradeUsecase) DeleteUpgradeTarget(ctx context.Context, id string) error {
	c, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	// 检查升级目标是否存在
	_, err := u.upgradeRepository.GetUpgradeTargetByID(c, id)
	if err != nil {
		return fmt.Errorf("升级目标不存在: %w", err)
	}

	return u.upgradeRepository.DeleteUpgradeTarget(c, id)
}

func (u *upgradeUsecase) CheckUpdate(ctx context.Context, request *domain.CheckUpdateRequest) (*domain.CheckUpdateResponse, error) {
	c, cancel := context.WithTimeout(ctx, u.contextTimeout)
	c.Value("key")
	defer cancel()

	// 这是旧的检查更新方法，目前保持不变但标记为废弃
	// 新的客户端应该使用 CheckUpdateByToken 方法
	return &domain.CheckUpdateResponse{
		HasUpdate:      false,
		CurrentVersion: request.CurrentVersion,
		LatestVersion:  request.CurrentVersion,
	}, errors.New("此方法已废弃，请使用基于token的升级检查")
}

func (u *upgradeUsecase) CheckUpdateByToken(ctx context.Context, request *domain.CheckUpdateRequest, clientIP, accessToken string) (*domain.CheckUpdateResponse, error) {
	c, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	// 如果没有注入clientAccessRepository，返回错误
	if u.clientAccessRepository == nil {
		return nil, errors.New("客户端接入功能未启用")
	}

	// 1. 根据access_token查找ClientAccess记录
	clientAccess, err := u.clientAccessRepository.GetByAccessToken(c, accessToken)
	if err != nil {
		return nil, fmt.Errorf("无效的访问令牌: %w", err)
	}

	// 2. 验证token有效性（未过期、已启用）
	if !clientAccess.IsActive {
		return nil, errors.New("客户端接入凭证已被禁用")
	}

	if clientAccess.ExpiresAt != nil && clientAccess.ExpiresAt.Before(time.Now()) {
		return nil, errors.New("客户端接入凭证已过期")
	}

	// 3. 更新使用统计
	if err := u.clientAccessRepository.UpdateUsage(c, accessToken, clientIP); err != nil {
		// 记录错误但不影响主流程
		fmt.Printf("更新客户端使用统计失败: %v\n", err)
	}

	// 4. 根据绑定的package_id获取升级目标
	upgradeTarget, err := u.upgradeRepository.GetActiveUpgradeTargetByPackageID(c, clientAccess.PackageID)
	if err != nil {
		// 没有找到升级目标，表示当前没有可用更新
		return &domain.CheckUpdateResponse{
			HasUpdate:      false,
			CurrentVersion: request.CurrentVersion,
			LatestVersion:  request.CurrentVersion,
		}, nil
	}

	// 比较版本，简单的字符串比较（实际项目中可能需要更复杂的版本比较逻辑）
	hasUpdate := upgradeTarget.Version != request.CurrentVersion

	response := &domain.CheckUpdateResponse{
		HasUpdate:      hasUpdate,
		CurrentVersion: request.CurrentVersion,
		LatestVersion:  upgradeTarget.Version,
	}

	// 如果有更新，填充下载信息
	if hasUpdate {
		response.DownloadURL = upgradeTarget.DownloadURL
		response.FileSize = upgradeTarget.FileSize
		response.FileHash = upgradeTarget.FileHash
		// 可以添加变更日志等信息
		if upgradeTarget.Description != "" {
			response.Changelog = upgradeTarget.Description
		}
	}

	return response, nil
}

func (u *upgradeUsecase) GetProjectUpgradeTargets(ctx context.Context, projectID string) ([]*domain.UpgradeTarget, error) {
	c, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	// 获取项目下的所有包
	packages, err := u.packageRepository.GetByProjectID(c, projectID)
	if err != nil {
		return nil, fmt.Errorf("获取项目包列表失败: %w", err)
	}

	if len(packages) == 0 {
		return []*domain.UpgradeTarget{}, nil
	}

	// 提取包ID
	packageIDs := make([]string, len(packages))
	for i, pkg := range packages {
		packageIDs[i] = pkg.ID
	}

	// 检查这些包的升级目标
	targets, err := u.upgradeRepository.CheckProjectUpgradeTargets(c, projectID, packageIDs)
	if err != nil {
		return nil, fmt.Errorf("获取项目升级目标失败: %w", err)
	}

	// 转换为slice
	var result []*domain.UpgradeTarget
	for _, target := range targets {
		result = append(result, target)
	}

	return result, nil
}
