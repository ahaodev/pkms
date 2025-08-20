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
            const transformedPackages = (response.data.list || []).map(PackagesAPI.transformPackageFromBackend);
            return {
                data: transformedPackages,
                total: response.data.total,
                page: response.data.page,
                pageSize: response.data.page_size,
                totalPages: response.data.total_pages,
            };
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
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