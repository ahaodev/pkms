import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getRecentActivities, transformDashboardStatsFromBackend } from '@/lib/api/dashboard';
import type { DashboardStats, RecentActivity } from '@/lib/api/dashboard';
import { SUCCESS } from '@/types/api-response';

// 使用仪表盘统计数据的 hook
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await getDashboardStats();
      if (response.code === SUCCESS && response.data) {
        return transformDashboardStatsFromBackend(response.data);
      }
      throw new Error(response.msg || 'Failed to fetch dashboard stats');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (was cacheTime in older versions)
    retry: (failureCount, error: Error & { response?: { status?: number } }) => {
      // Don't retry on authentication errors
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
}

// 使用最近活动数据的 hook
export function useRecentActivities(limit = 10) {
  return useQuery<RecentActivity[]>({
    queryKey: ['dashboard', 'activities', limit],
    queryFn: async () => {
      const response = await getRecentActivities(limit);
      if (response.code === SUCCESS && response.data) {
        return response.data;
      }
      throw new Error(response.msg || 'Failed to fetch recent activities');
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes (was cacheTime in older versions)
    retry: (failureCount, error: Error & { response?: { status?: number } }) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
}

// 合并的仪表盘数据 hook
export function useDashboardData() {
  const statsQuery = useDashboardStats();
  const activitiesQuery = useRecentActivities();

  return {
    stats: statsQuery.data,
    activities: activitiesQuery.data,
    isLoading: statsQuery.isLoading || activitiesQuery.isLoading,
    isError: statsQuery.isError || activitiesQuery.isError,
    error: statsQuery.error || activitiesQuery.error,
    refetch: () => {
      statsQuery.refetch();
      activitiesQuery.refetch();
    },
  };
}

export type { DashboardStats, RecentActivity };