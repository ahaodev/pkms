import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {PackageFilters} from '@/types/simplified';
import * as PackagesAPI from '@/lib/api/packages';
import {useAuth} from '@/providers/auth-provider.tsx';

export const usePackages = (filters?: PackageFilters) => {
    const {user, isAdmin} = useAuth();
    
    return useQuery({
        queryKey: ['packages', filters, user?.id],
        queryFn: async () => {
            const response = await PackagesAPI.getPackages(filters);
            const transformedPackages = (response.data || []).map(PackagesAPI.transformPackageFromBackend);
            return {
                data: transformedPackages,
                total: response.total,
                page: response.page,
                pageSize: response.pageSize,
                totalPages: response.totalPages,
            };
        },
        select: (result) => {
            if (!user || !result) {
                return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 1 };
            }
            
            let filtered = result.data;
            
            // Apply permission filtering for non-admin users
            if (!isAdmin()) {
                // Filter packages based on user's tenant/permissions
                // Backend should handle this, but frontend can provide additional filtering if needed
                filtered = result.data; // Trust backend permissions for now
            }
            
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
