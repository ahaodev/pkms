import { useQuery } from '@tanstack/react-query';
import { getPackageReleases, getPackageReleasesAll } from '@/lib/api/packages';

// 支持服务器端分页的版本
export const useReleasesWithPagination = (packageId?: string, page: number = 1, pageSize: number = 20) => {
    return useQuery({
        queryKey: ['releases', 'paginated', packageId, page, pageSize],
        queryFn: async () => {
            if (!packageId) {
                return { list: [], total: 0, page: 1, page_size: pageSize, total_pages: 0 };
            }
            const response = await getPackageReleases(packageId, page, pageSize);
            return response;
        },
        enabled: !!packageId,
        staleTime: 0,
        gcTime: 5 * 60 * 1000, // 保持5分钟缓存用于后退导航
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    });
};

// 保持向后兼容的原有版本
export const useReleases = (packageId?: string) => {
    return useQuery({
        queryKey: ['releases', packageId],
        queryFn: async () => {
            if (!packageId) {
                return [];
            }
            const response = await getPackageReleasesAll(packageId);
            // getPackageReleasesAll returns ApiResponse<Release[]> with data array
            return response.data;
        },
        enabled: !!packageId,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    });
};