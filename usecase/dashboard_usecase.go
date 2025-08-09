package usecase

import (
	"context"
	"time"

	"pkms/domain"
	"pkms/internal/casbin"
)

type dashboardUsecase struct {
	dashboardRepository domain.DashboardRepository
	casbinManager       *casbin.CasbinManager
	contextTimeout      time.Duration
}

func NewDashboardUsecase(
	dashboardRepository domain.DashboardRepository,
	casbinManager *casbin.CasbinManager,
	timeout time.Duration,
) domain.DashboardUsecase {
	return &dashboardUsecase{
		dashboardRepository: dashboardRepository,
		casbinManager:       casbinManager,
		contextTimeout:      timeout,
	}
}

func (du *dashboardUsecase) GetStats(c context.Context, tenantID string) (domain.DashboardStats, error) {
	ctx, cancel := context.WithTimeout(c, du.contextTimeout)
	defer cancel()

	return du.dashboardRepository.GetStats(ctx, tenantID)
}

func (du *dashboardUsecase) GetRecentActivities(c context.Context, tenantID string, userID string, limit int) ([]domain.RecentActivity, error) {
	ctx, cancel := context.WithTimeout(c, du.contextTimeout)
	defer cancel()

	// 使用专门的dashboard repository处理复杂的统计查询
	return du.dashboardRepository.GetRecentActivities(ctx, tenantID, userID, limit)
}
