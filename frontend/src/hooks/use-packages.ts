import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {PackageFilters} from '@/types/package';
import * as PackagesAPI from '@/lib/api/packages';
import {useAuth} from '@/providers/auth-provider.tsx';

export const usePackages = (filters?: PackageFilters) => {
    const {user} = useAuth();
    
    return useQuery({
        queryKey: ['packages', filters, user?.id],
        queryFn: async () => {
            const response = await PackagesAPI.getPackages(filters);
            const transformedPackages = (response.list || []).map(PackagesAPI.transformPackageFromBackend);
            return {
                data: transformedPackages,
                total: response.total,
                page: response.page,
                pageSize: response.page_size,
                totalPages: response.total_pages,
            };
        },
        enabled: !!user && !!filters?.projectId,
        select: (result) => {
            if (!user || !result) {
                return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 1 };
            }
            
            const filtered = result.data;

            return {
                ...result,
                data: filtered,
            };
        },
    });
};


export const useDeletePackage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await PackagesAPI.deletePackage(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['packages']});
        },
    });
};