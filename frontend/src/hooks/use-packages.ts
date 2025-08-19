import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {PackageFilters} from '@/types/package';
import * as PackagesAPI from '@/lib/api/packages';
import {useAuth} from '@/providers/auth-provider.tsx';
import {createShareLink} from "@/lib/api/releases.ts";

export const usePackages = (filters?: PackageFilters) => {
    const {user} = useAuth();
    
    
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

export const useGenerateShareLink = () => {
    return useMutation({
        mutationFn: async ({packageId, expiresIn}: { packageId: string; expiresIn?: number }) => {
            const response = await createShareLink(packageId, { expiryHours: expiresIn });
            return response.data;
        },
    });
};
