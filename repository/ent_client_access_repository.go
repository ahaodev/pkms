package repository

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"time"

	"pkms/domain"
	"pkms/ent"
	"pkms/ent/clientaccess"
)

type entClientAccessRepository struct {
	client *ent.Client
}

func NewClientAccessRepository(client *ent.Client) domain.ClientAccessRepository {
	return &entClientAccessRepository{
		client: client,
	}
}

// generateAccessToken 生成32字节的随机访问令牌
func generateAccessToken() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func (r *entClientAccessRepository) Create(ctx context.Context, access *domain.ClientAccess) error {
	builder := r.client.ClientAccess.
		Create().
		SetTenantID(access.TenantID).
		SetProjectID(access.ProjectID).
		SetPackageID(access.PackageID).
		SetName(access.Name).
		SetIsActive(access.IsActive).
		SetCreatedBy(access.CreatedBy)

	// 如果没有提供access_token，则生成一个
	if access.AccessToken == "" {
		access.AccessToken = generateAccessToken()
	}
	builder = builder.SetAccessToken(access.AccessToken)

	// 可选字段
	if access.Description != "" {
		builder = builder.SetDescription(access.Description)
	}
	if access.ExpiresAt != nil {
		builder = builder.SetExpiresAt(*access.ExpiresAt)
	}

	created, err := builder.Save(ctx)
	if err != nil {
		return err
	}

	// 更新domain对象
	access.ID = created.ID
	access.AccessToken = created.AccessToken
	access.CreatedAt = created.CreatedAt
	access.UpdatedAt = created.UpdatedAt
	return nil
}

func (r *entClientAccessRepository) GetByID(ctx context.Context, id string) (*domain.ClientAccess, error) {
	ca, err := r.client.ClientAccess.
		Query().
		Where(clientaccess.ID(id)).
		WithTenant().
		WithProject().
		WithPackage().
		WithCreator().
		First(ctx)

	if err != nil {
		return nil, err
	}

	return r.entToClientAccess(ca), nil
}

func (r *entClientAccessRepository) GetByAccessToken(ctx context.Context, token string) (*domain.ClientAccess, error) {
	ca, err := r.client.ClientAccess.
		Query().
		Where(clientaccess.AccessToken(token)).
		WithTenant().
		WithProject().
		WithPackage().
		WithCreator().
		First(ctx)

	if err != nil {
		return nil, err
	}

	return r.entToClientAccess(ca), nil
}

func (r *entClientAccessRepository) GetList(ctx context.Context, tenantID string, filters map[string]interface{}, queryParams *domain.QueryParams) (*domain.PagedResult[*domain.ClientAccess], error) {
	query := r.client.ClientAccess.
		Query().
		Where(clientaccess.TenantID(tenantID)).
		WithTenant().
		WithProject().
		WithPackage().
		WithCreator()

	// 应用过滤条件
	if projectID, ok := filters["project_id"].(string); ok && projectID != "" {
		query = query.Where(clientaccess.ProjectID(projectID))
	}
	if packageID, ok := filters["package_id"].(string); ok && packageID != "" {
		query = query.Where(clientaccess.PackageID(packageID))
	}
	if isActive, ok := filters["is_active"].(bool); ok {
		query = query.Where(clientaccess.IsActive(isActive))
	}

	// 按创建时间倒序排列
	query = query.Order(ent.Desc(clientaccess.FieldCreatedAt))

	// 获取总数
	total, err := query.Count(ctx)
	if err != nil {
		return nil, err
	}

	// 应用分页
	offset := (queryParams.Page - 1) * queryParams.PageSize
	clientAccesses, err := query.Offset(offset).Limit(queryParams.PageSize).All(ctx)
	if err != nil {
		return nil, err
	}

	var result []*domain.ClientAccess
	for _, ca := range clientAccesses {
		result = append(result, r.entToClientAccess(ca))
	}

	return domain.NewPagedResult(result, total, queryParams.Page, queryParams.PageSize), nil
}

func (r *entClientAccessRepository) Update(ctx context.Context, id string, updates map[string]interface{}) error {
	query := r.client.ClientAccess.UpdateOneID(id)

	if name, ok := updates["name"].(string); ok {
		query = query.SetName(name)
	}
	if description, ok := updates["description"].(string); ok {
		query = query.SetDescription(description)
	}
	if isActive, ok := updates["is_active"].(bool); ok {
		query = query.SetIsActive(isActive)
	}
	if expiresAt, ok := updates["expires_at"].(*time.Time); ok {
		if expiresAt != nil {
			query = query.SetExpiresAt(*expiresAt)
		} else {
			query = query.ClearExpiresAt()
		}
	}
	if accessToken, ok := updates["access_token"].(string); ok {
		query = query.SetAccessToken(accessToken)
	}

	_, err := query.Save(ctx)
	return err
}

func (r *entClientAccessRepository) Delete(ctx context.Context, id string) error {
	return r.client.ClientAccess.
		DeleteOneID(id).
		Exec(ctx)
}

func (r *entClientAccessRepository) UpdateUsage(ctx context.Context, token string, ip string) error {
	now := time.Now()
	_, err := r.client.ClientAccess.
		Update().
		Where(clientaccess.AccessToken(token)).
		SetLastUsedAt(now).
		SetLastUsedIP(ip).
		AddUsageCount(1).
		Save(ctx)
	return err
}

// entToClientAccess 将Ent实体转换为domain实体
func (r *entClientAccessRepository) entToClientAccess(ca *ent.ClientAccess) *domain.ClientAccess {
	access := &domain.ClientAccess{
		ID:          ca.ID,
		TenantID:    ca.TenantID,
		ProjectID:   ca.ProjectID,
		PackageID:   ca.PackageID,
		AccessToken: ca.AccessToken,
		Name:        ca.Name,
		Description: ca.Description,
		IsActive:    ca.IsActive,
		UsageCount:  ca.UsageCount,
		CreatedAt:   ca.CreatedAt,
		UpdatedAt:   ca.UpdatedAt,
		CreatedBy:   ca.CreatedBy,
	}

	// 处理可选字段（Ent使用零值表示空值）
	if !ca.ExpiresAt.IsZero() {
		access.ExpiresAt = &ca.ExpiresAt
	}
	if !ca.LastUsedAt.IsZero() {
		access.LastUsedAt = &ca.LastUsedAt
	}
	if ca.LastUsedIP != "" {
		access.LastUsedIP = ca.LastUsedIP
	}

	// 填充关联信息
	if ca.Edges.Project != nil {
		access.ProjectName = ca.Edges.Project.Name
	}
	if ca.Edges.Package != nil {
		access.PackageName = ca.Edges.Package.Name
	}
	if ca.Edges.Creator != nil {
		access.CreatorName = ca.Edges.Creator.Username
	}

	return access
}
