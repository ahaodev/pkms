import { useQuery } from '@tanstack/react-query';
import { getPackageReleases } from '@/lib/api/packages';

export const useReleases = (packageId?: string) => {
    return useQuery({
        queryKey: ['releases', packageId],
        queryFn: async () => {
            if (!packageId) {
                return { data: [] };
            }
            const response = await getPackageReleases(packageId);
            return response;
        },
        enabled: !!packageId,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    });
};