import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Package, PackageFilters, PackageUpload, UploadProgress} from '@/types/simplified';
import * as PackagesAPI from '@/lib/api/packages';
import {useAuth} from '@/contexts/simple-auth-context';

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
                // filtered = filtered.filter((pkg: Package) => canAccessProject(pkg.projectId) || pkg.isPublic);
                // 临时注释权限过滤，显示所有包
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

export const useUploadPackage = (onProgress?: (progress: UploadProgress) => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (upload: PackageUpload) => {
            const response = await PackagesAPI.uploadPackage(upload, onProgress);
            return PackagesAPI.transformPackageFromBackend(response.data);
        },
        onSuccess: (_, upload) => {
            queryClient.invalidateQueries({queryKey: ['packages']});
            queryClient.invalidateQueries({queryKey: ['packages', 'project', upload.projectId]});
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

export const usePackagesByProject = (projectId: string) => {
    const {user, isAdmin, canAccessProject} = useAuth();
    
    return useQuery({
        queryKey: ['packages', 'project', projectId, user?.id],
        queryFn: async () => {
            const response = await PackagesAPI.getPackagesByProject(projectId);
            return response.data.map(PackagesAPI.transformPackageFromBackend);
        },
        select: (packages) => {
            if (!user || !packages) return [];
            
            // 管理员可以看到所有包
            if (isAdmin()) {
                return packages;
            }
            
            // 普通用户只能看到有权限访问的项目的包
            if (canAccessProject(projectId)) {
                return packages;
            }
            
            // 如果没有权限，返回空数组
            return [];
        },
        enabled: !!projectId,
    });
};

export const useUpdatePackage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({id, update}: { id: string; update: Partial<Package> }) => {
            const response = await PackagesAPI.updatePackage(id, update);
            return PackagesAPI.transformPackageFromBackend(response.data);
        },
        onSuccess: (_, {id}) => {
            queryClient.invalidateQueries({queryKey: ['packages']});
            queryClient.invalidateQueries({queryKey: ['package', id]});
        },
    });
};

export const useCheckVersion = () => {
    return useMutation({
        mutationFn: async (params: { packageId: string; currentVersion: string }) => {
            // 这个功能需要在后端实现对应的API
            console.log('Checking version for package:', params.packageId, 'version:', params.currentVersion);
            throw new Error('Version check not implemented yet');
        },
    });
};

export const useVersionHistory = (packageId: string) => {
    return useQuery({
        queryKey: ['package', packageId, 'versions'],
        queryFn: async () => {
            const response = await PackagesAPI.getPackageVersions(packageId);
            return response.data.map(PackagesAPI.transformPackageFromBackend);
        },
        enabled: !!packageId,
    });
};

export const useShareInfo = (shareToken: string) => {
    return useQuery({
        queryKey: ['share', shareToken],
        queryFn: async () => {
            const response = await PackagesAPI.getSharedPackage(shareToken);
            return PackagesAPI.transformPackageFromBackend(response.data);
        },
        enabled: !!shareToken,
    });
};

export const useDownloadSharedPackage = () => {
    return useMutation({
        mutationFn: async (shareToken: string) => {
            const response = await PackagesAPI.getSharedPackage(shareToken);
            return PackagesAPI.transformPackageFromBackend(response.data);
        },
    });
};

export const usePackageVersions = (packageName?: string, packageType?: string) => {
    const {user, isAdmin, canAccessProject} = useAuth();
    
    return useQuery({
        queryKey: ['package-versions', packageName, packageType, user?.id],
        queryFn: async () => {
            if (!packageName || !packageType) {
                return [];
            }
            const response = await PackagesAPI.getPackageVersionsByNameAndType(packageName, packageType);
            const transformedPackages = (response.data || []).map(PackagesAPI.transformPackageFromBackend);
            return transformedPackages;
        },
        select: (result) => {
            if (!user || !result) {
                return [];
            }
            let filtered = result;
            if (!isAdmin()) {
                filtered = filtered.filter((pkg: Package) => canAccessProject(pkg.projectId) || (pkg as any).isPublic);
            }
            // 按版本排序（最新版本在前）
            return filtered.sort((a, b) => {
                return b.createdAt.getTime() - a.createdAt.getTime();
            });
        },
        enabled: !!(packageName && packageType && user),
    });
};
