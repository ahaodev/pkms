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