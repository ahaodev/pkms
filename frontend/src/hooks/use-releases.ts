import { useQuery } from '@tanstack/react-query';
import { getPackageReleases} from '@/lib/api/packages';

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
    });
};