package usecase

import (
	"context"
	"crypto/md5"
	"fmt"
	"github.com/rs/xid"
	"io"
	"strings"
	"time"

	"pkms/domain"
)

type packageUsecase struct {
	packageRepository domain.PackageRepository
	fileRepository    domain.FileRepository
	contextTimeout    time.Duration
}

func NewPackageUsecase(packageRepository domain.PackageRepository, fileRepository domain.FileRepository, timeout time.Duration) domain.PackageUsecase {
	return &packageUsecase{
		packageRepository: packageRepository,
		fileRepository:    fileRepository,
		contextTimeout:    timeout,
	}
}

func (pu *packageUsecase) Create(c context.Context, pkg *domain.Package) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.packageRepository.Create(ctx, pkg)
}

func (pu *packageUsecase) Fetch(c context.Context, page, pageSize int) ([]domain.Package, int, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.packageRepository.Fetch(ctx, page, pageSize)
}

func (pu *packageUsecase) GetByID(c context.Context, id string) (domain.Package, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.packageRepository.GetByID(ctx, id)
}

func (pu *packageUsecase) Update(c context.Context, pkg *domain.Package) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.packageRepository.Update(ctx, pkg)
}

func (pu *packageUsecase) Delete(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.packageRepository.Delete(ctx, id)
}

func (pu *packageUsecase) GetByProjectID(c context.Context, projectID string) ([]domain.Package, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.packageRepository.GetByProjectID(ctx, projectID)
}

func (pu *packageUsecase) GetByShareToken(c context.Context, token string) (domain.Package, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()
	return pu.packageRepository.GetByShareToken(ctx, token)
}

// UploadPackage 上传包文件和元信息
func (pu *packageUsecase) UploadPackage(c context.Context, req *domain.PackageUploadRequest) (*domain.PackageUploadResult, error) {
	ctx, cancel := context.WithTimeout(c, pu.contextTimeout)
	defer cancel()

	// 构建文件存储路径：packages/{project_id}/{package_name}/{version}/
	objectName := fmt.Sprintf("packages/%s/%s/%s/%s", req.ProjectID, req.Name, req.Version, req.FileName)

	// 计算文件检验和
	fileData, err := io.ReadAll(req.File)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}
	checksum := fmt.Sprintf("%x", md5.Sum(fileData))

	// 上传文件到文件仓储
	uploadReq := &domain.UploadRequest{
		Bucket:      "packages", // 包文件存储桶
		ObjectName:  objectName,
		Reader:      strings.NewReader(string(fileData)),
		Size:        req.FileSize,
		ContentType: req.FileHeader,
	}

	uploadResult, err := pu.fileRepository.Upload(ctx, uploadReq)
	if err != nil {
		return nil, fmt.Errorf("failed to upload file: %w", err)
	}

	// 构建文件URL - 这里应该是可以下载的URL
	fileURL := fmt.Sprintf("/api/v1/files/download/%s/%s", uploadResult.Bucket, uploadResult.Key)

	// 构建包对象
	pkg := &domain.Package{
		ProjectID:        req.ProjectID,
		Name:             req.Name,
		Description:      req.Description,
		Type:             req.Type,
		Version:          req.Version,
		FileURL:          fileURL,
		FileName:         req.FileName,
		FileSize:         uploadResult.Size,
		Checksum:         checksum,
		Changelog:        req.Changelog,
		IsLatest:         req.IsLatest,
		DownloadCount:    0,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
		VersionCode:      req.VersionCode,
		MinSDKVersion:    req.MinSDKVersion,
		TargetSDKVersion: req.TargetSDKVersion,
		ShareExpiry:      req.ShareExpiry,
		ShareToken:       xid.New().String(),
		IsPublic:         req.IsPublic,
	}

	// 如果标记为最新版本，需要更新同项目同名包的 IsLatest 状态
	if req.IsLatest {
		existingPackages, err := pu.packageRepository.GetByProjectID(ctx, req.ProjectID)
		if err == nil {
			for _, existingPkg := range existingPackages {
				if existingPkg.Name == req.Name && existingPkg.IsLatest {
					existingPkg.IsLatest = false
					pu.packageRepository.Update(ctx, &existingPkg)
				}
			}
		}
	}

	// 保存包信息到数据库
	if err := pu.packageRepository.Create(ctx, pkg); err != nil {
		// 如果数据库保存失败，尝试删除已上传的文件
		pu.fileRepository.Delete(ctx, uploadResult.Bucket, uploadResult.Key)
		return nil, fmt.Errorf("failed to save package info: %w", err)
	}

	// 构建返回结果
	result := &domain.PackageUploadResult{
		Package:    pkg,
		FileURL:    fileURL,
		UploadSize: uploadResult.Size,
		Message:    "Package uploaded successfully",
	}

	return result, nil
}
