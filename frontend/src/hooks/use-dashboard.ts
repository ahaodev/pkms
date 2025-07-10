// use-dashboard.ts
// Dashboard 相关数据的自定义 hooks，基于 react-query 实现，直接调用 API
import {useQuery} from '@tanstack/react-query';
import * as DashboardAPI from '@/lib/api/dashboard';

// Query keys
export const dashboardKeys = {
    all: ['dashboard'] as const,
    stats: () => [...dashboardKeys.all, 'stats'] as const,
    deploymentChart: (days?: number) => [...dashboardKeys.all, 'deploymentChart', days] as const,
    deploymentTime: (weeks?: number) => [...dashboardKeys.all, 'deploymentTime', weeks] as const,
    environment: () => [...dashboardKeys.all, 'environment'] as const,
    activity: (limit?: number) => [...dashboardKeys.all, 'activity', limit] as const,
    successRate: (days?: number) => [...dashboardKeys.all, 'successRate', days] as const,
    avgTime: (days?: number) => [...dashboardKeys.all, 'avgTime', days] as const,
};

// 获取 Dashboard 统计数据
export const useDashboardStats = () => {
    return useQuery({
        queryKey: dashboardKeys.stats(),
        queryFn: () => DashboardAPI.getDashboardStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// 获取部署趋势图数据
export const useDeploymentChartData = (days?: number) => {
    return useQuery({
        queryKey: dashboardKeys.deploymentChart(days),
        queryFn: () => DashboardAPI.getPackageChartData(),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

// 获取部署耗时数据
export const useDeploymentTimeData = (weeks?: number) => {
    return useQuery({
        queryKey: dashboardKeys.deploymentTime(weeks),
        queryFn: () => DashboardAPI.getDownloadChartData(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// 获取环境分布数据
export const useEnvironmentDistribution = () => {
    return useQuery({
        queryKey: dashboardKeys.environment(),
        queryFn: () => DashboardAPI.getUserChartData(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

// 获取近期活动数据
export const useRecentActivity = (limit?: number) => {
    return useQuery({
        queryKey: dashboardKeys.activity(limit),
        queryFn: () => DashboardAPI.getRecentActivities(limit),
        staleTime: 1 * 60 * 1000, // 1 minute
    });
};

// 获取成功率指标
export const useSuccessRateMetrics = (days?: number) => {
    return useQuery({
        queryKey: dashboardKeys.successRate(days),
        queryFn: () => DashboardAPI.getUserChartData(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// 获取平均部署耗时
export const useAverageDeploymentTime = (days?: number) => {
    return useQuery({
        queryKey: dashboardKeys.avgTime(days),
        queryFn: () => DashboardAPI.getDownloadChartData(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
