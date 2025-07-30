import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {PackageFilters} from '@/types/package';
import * as PackagesAPI from '@/lib/api/packages';
import {useAuth} from '@/providers/auth-provider.tsx';
import {createShareLink} from "@/lib/api/releases.ts";

export const usePackages = (filters?: PackageFilters) => {
    const {user, hasRole} = useAuth();
    
    console.log('usePackages called with filters:', filters);
    
    return useQuery({
        queryKey: ['packages', filters, user?.id],
        queryFn: async () => {
            console.log('usePackages queryFn called with filters:', filters);
            const response = await PackagesAPI.getPackages(filters);
            console.log('usePackages API response:', response);
            const transformedPackages = (response.data || []).map(PackagesAPI.transformPackageFromBackend);
            console.log('usePackages transformed packages:', transformedPackages);
            return {
                data: transformedPackages,
                total: response.total,
                page: response.page,
                pageSize: response.pageSize,
                totalPages: response.totalPages,
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
            
            let filtered = result.data;
            
            // Apply permission filtering for non-admin users
            if (!hasRole('admin')) {
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
            const response = await createShareLink(packageId, { expiryHours: expiresIn });
            return response.data;
        },
    });
};
