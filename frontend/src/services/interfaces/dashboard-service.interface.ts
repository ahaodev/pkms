import {DashboardStats, ChartData, Environment, ActivityItem, ApiResponse} from '@/types';

export interface DashboardService {
    // Dashboard statistics
    getDashboardStats(): Promise<ApiResponse<DashboardStats>>;

    // Chart data
    getDeploymentChartData(days?: number): Promise<ApiResponse<ChartData[]>>;

    getDeploymentTimeData(weeks?: number): Promise<ApiResponse<ChartData[]>>;

    getEnvironmentDistribution(): Promise<ApiResponse<Environment[]>>;

    // Activity feed
    getRecentActivity(limit?: number): Promise<ApiResponse<ActivityItem[]>>;

    // Performance metrics
    getSuccessRateMetrics(days?: number): Promise<ApiResponse<{ rate: number; trend: string }>>;

    getAverageDeploymentTime(days?: number): Promise<ApiResponse<{ time: string; trend: string }>>;
}
