import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {PackageFilters} from '@/types/simplified';
import * as PackagesAPI from '@/lib/api/packages';
import {useAuth} from '@/providers/auth-provider.tsx';

export const usePackages = (filters?: PackageFilters) => {
    const {user, isAdmin} = useAuth();
    
    console.log('usePackages - filters:', filters);
    console.log('usePackages - user:', user);
    console.log('usePackages - isAdmin:', isAdmin());
    
    return useQuery({
        queryKey: ['packages', filters, user?.id],
        queryFn: async () => {
            console.log('usePackages - queryFn called with filters:', filters);
            const response = await PackagesAPI.getPackages(filters);
            console.log('usePackages - API response:', response);
            const transformedPackages = (response.data || []).map(PackagesAPI.transformPackageFromBackend);
            console.log('usePackages - transformed packages:', transformedPackages);
            return {
                data: transformedPackages,
                total: response.total,
                page: response.page,
                pageSize: response.pageSize,
                totalPages: response.totalPages,
            };
        },
        select: (result) => {
            console.log('usePackages - select called with result:', result);
            if (!user || !result) {
                console.log('usePackages - no user or result, returning empty');
                return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 1 };
            }
            const filtered = result.data;
            
            // 临时禁用权限过滤进行调试
            console.log('usePackages - before filtering:', filtered.length);
            if (!isAdmin()) {
                const originalCount = filtered.length;
                console.log('usePackages - 权限过滤已临时禁用');
                console.log('usePackages - filtered packages:', `${originalCount} -> ${filtered.length}`);
            }
            const finalResult = {
                ...result,
                data: filtered,
            };
            console.log('usePackages - final result:', finalResult);
            return finalResult;
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



export const useGenerateShareLink = () => {
    return useMutation({
        mutationFn: async ({packageId, expiresIn}: { packageId: string; expiresIn?: number }) => {
            const response = await PackagesAPI.createShareLink(packageId, { expiryHours: expiresIn });
            return response.data;
        },
    });
};

export const usePackage = (id: string) => {
    return useQuery({
        queryKey: ['package', id],
        queryFn: async () => {
            const response = await PackagesAPI.getPackage(id);
            return PackagesAPI.transformPackageFromBackend(response.data);
        },
        enabled: !!id,
    });
};
