package usecase

import (
	"context"
	"errors"
	"fmt"
	"time"

	"pkms/domain"
)

type upgradeUsecase struct {
	upgradeRepository domain.UpgradeRepository
	projectRepository domain.ProjectRepository
	packageRepository domain.PackageRepository
	releaseRepository domain.ReleaseRepository
	contextTimeout    time.Duration
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
	defer cancel()

	// 根据packageID获取激活的升级目标
	target, err := u.upgradeRepository.GetActiveUpgradeTargetByPackageID(c, request.PackageID)
	if err != nil {
		// 如果没有找到升级目标，表示没有更新
		return &domain.CheckUpdateResponse{
			HasUpdate:      false,
			CurrentVersion: request.CurrentVersion,
			LatestVersion:  request.CurrentVersion,
		}, nil
	}

	// 比较版本，这里简化处理，只要版本不同就认为有更新
	hasUpdate := request.CurrentVersion != target.Version

	response := &domain.CheckUpdateResponse{
		HasUpdate:      hasUpdate,
		CurrentVersion: request.CurrentVersion,
		LatestVersion:  target.Version,
	}

	// 如果有更新，填充下载信息
	if hasUpdate {
		response.DownloadURL = target.DownloadURL
		response.FileSize = target.FileSize
		response.FileHash = target.FileHash

		// 获取release信息
		if target.ReleaseID != "" {
			release, err := u.releaseRepository.GetByID(c, target.ReleaseID)
			if err == nil {
				response.Changelog = release.ChangeLog
				response.ReleaseNotes = release.VersionName
			}
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
