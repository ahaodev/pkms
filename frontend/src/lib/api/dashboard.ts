import {apiClient} from "@/lib/api/api";
import {ApiResponse} from "@/types/api-response";

// 仪表盘统计数据类型
export interface DashboardStats {
    totalProjects: number;
    totalPackages: number;
    totalUsers: number;
    totalGroups?: number;
    totalDownloads?: number;
    storageUsed?: number;
    activeUsers?: number;
}

// 最近活动类型（匹配后端返回格式）
export interface RecentActivity {
    id: string;
    type: string; // "project_created", "package_created", "user_joined"
    description: string;
    user_id: string;
    created_at: string;
}

// 图表数据类型
export interface ChartData {
    labels: string[];
    data: number[];
    label: string;
}

// 获取仪表盘统计数据
export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const resp = await apiClient.get("/api/v1/dashboard/stats");
    return resp.data;
}

// 获取最近活动
export async function getRecentActivities(limit?: number): Promise<ApiResponse<RecentActivity[]>> {
    const params = limit ? `?limit=${limit}` : '';
    const resp = await apiClient.get(`/api/v1/dashboard/activities${params}`);
    return resp.data;
}

// 获取包相关图表数据
export async function getPackageChartData(period?: 'week' | 'month' | 'year'): Promise<ApiResponse<ChartData>> {
    const params = period ? `?period=${period}` : '';
    const resp = await apiClient.get(`/api/v1/dashboard/charts/packages${params}`);
    return resp.data;
}

// 获取用户相关图表数据
export async function getUserChartData(period?: 'week' | 'month' | 'year'): Promise<ApiResponse<ChartData>> {
    const params = period ? `?period=${period}` : '';
    const resp = await apiClient.get(`/api/v1/dashboard/charts/users${params}`);
    return resp.data;
}

// 获取下载量图表数据
export async function getDownloadChartData(period?: 'week' | 'month' | 'year'): Promise<ApiResponse<ChartData>> {
    const params = period ? `?period=${period}` : '';
    const resp = await apiClient.get(`/api/v1/dashboard/charts/downloads${params}`);
    return resp.data;
}

// 数据转换函数：后端数据转前端格式
export function transformDashboardStatsFromBackend(backendStats: any): DashboardStats {
    return {
        totalProjects: backendStats.total_projects || 0,
        totalPackages: backendStats.total_packages || 0,
        totalUsers: backendStats.total_users || 0,
        totalDownloads: backendStats.total_downloads || 0,
        storageUsed: backendStats.storage_used || 0,
        activeUsers: backendStats.active_users || 0
    };
}

export function transformRecentActivityFromBackend(backendActivity: any): RecentActivity {
    return {
        id: backendActivity.id,
        type: backendActivity.type,
        description: backendActivity.description,
        user_id: backendActivity.user_id,
        created_at: backendActivity.created_at
    };
}

export function transformChartDataFromBackend(backendChart: any): ChartData {
    return {
        labels: backendChart.labels || [],
        data: backendChart.data || [],
        label: backendChart.label || ''
    };
}
