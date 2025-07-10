import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Package, PackageFilters, PackageUpload, UploadProgress} from '@/types/simplified';
import * as PackagesAPI from '@/lib/api/packages';
import {useAuth} from '@/contexts/simple-auth-context';

// 根据环境变量选择使用真实API还是模拟数据
const useRealApi = import.meta.env.VITE_USE_REAL_API === 'true';

export const usePackages = (filters?: PackageFilters) => {
    const {user, isAdmin, canAccessProject} = useAuth();
    
    return useQuery({
        queryKey: ['packages', filters, user?.id],
        queryFn: async () => {
            if (useRealApi) {
                const response = await PackagesAPI.getPackages(filters);
                return response.data;
            } else {
                // 模拟数据暂时返回空数组
                return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
            }
        },
        select: (data) => {
            if (!user || !data) return [];
            
            const packages = useRealApi ? (data.items || []) : data.items;
            
            // 管理员可以看到所有包
            if (isAdmin()) {
                return packages;
            }
            
            // 普通用户只能看到有权限访问的项目的包
            return packages.filter((pkg: Package) => 
                canAccessProject(pkg.projectId) || 
                pkg.isPublic
            );
        },
    });
};

export const usePackage = (id: string) => {
    return useQuery({
        queryKey: ['package', id],
        queryFn: async () => {
            if (useRealApi) {
                const response = await PackagesAPI.getPackage(id);
                return PackagesAPI.transformPackageFromBackend(response.data);
            } else {
                throw new Error('Package not found');
            }
        },
        enabled: !!id,
    });
};

export const usePackagesByProject = (projectId: string) => {
    const {user, isAdmin, canAccessProject} = useAuth();
    
    return useQuery({
        queryKey: ['packages', 'project', projectId, user?.id],
        queryFn: async () => {
            if (useRealApi) {
                const response = await PackagesAPI.getPackagesByProject(projectId);
                return response.data.map(PackagesAPI.transformPackageFromBackend);
            } else {
                return [];
            }
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

export const useUploadPackage = (onProgress?: (progress: UploadProgress) => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (upload: PackageUpload) => {
            if (useRealApi) {
                const response = await PackagesAPI.uploadPackage(upload, onProgress);
                return PackagesAPI.transformPackageFromBackend(response.data);
            } else {
                throw new Error('Upload not available in mock mode');
            }
        },
        onSuccess: (_, upload) => {
            queryClient.invalidateQueries({queryKey: ['packages']});
            queryClient.invalidateQueries({queryKey: ['packages', 'project', upload.projectId]});
        },
    });
};

export const useUpdatePackage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({id, update}: { id: string; update: Partial<Package> }) => {
            if (useRealApi) {
                const response = await PackagesAPI.updatePackage(id, update);
                return PackagesAPI.transformPackageFromBackend(response.data);
            } else {
                throw new Error('Update not available in mock mode');
            }
        },
        onSuccess: (_, {id}) => {
            queryClient.invalidateQueries({queryKey: ['packages']});
            queryClient.invalidateQueries({queryKey: ['package', id]});
        },
    });
};

export const useDeletePackage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            if (useRealApi) {
                await PackagesAPI.deletePackage(id);
            } else {
                throw new Error('Delete not available in mock mode');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['packages']});
        },
    });
};

export const useCheckVersion = () => {
    return useMutation({
        mutationFn: async (params: { packageId: string; currentVersion: string }) => {
            if (useRealApi) {
                // 这个功能需要在后端实现对应的API
                console.log('Checking version for package:', params.packageId, 'version:', params.currentVersion);
                throw new Error('Version check not implemented yet');
            } else {
                throw new Error('Version check not available in mock mode');
            }
        },
    });
};

export const useVersionHistory = (packageId: string) => {
    return useQuery({
        queryKey: ['package', packageId, 'versions'],
        queryFn: async () => {
            if (useRealApi) {
                const response = await PackagesAPI.getPackageVersions(packageId);
                return response.data.map(PackagesAPI.transformPackageFromBackend);
            } else {
                return [];
            }
        },
        enabled: !!packageId,
    });
};

export const useGenerateShareLink = () => {
    return useMutation({
        mutationFn: async ({packageId, expiresIn}: { packageId: string; expiresIn?: number }) => {
            if (useRealApi) {
                const response = await PackagesAPI.createShareLink(packageId, { expiryHours: expiresIn });
                return response.data;
            } else {
                throw new Error('Share link generation not available in mock mode');
            }
        },
    });
};

export const useShareInfo = (shareToken: string) => {
    return useQuery({
        queryKey: ['share', shareToken],
        queryFn: async () => {
            if (useRealApi) {
                const response = await PackagesAPI.getSharedPackage(shareToken);
                return PackagesAPI.transformPackageFromBackend(response.data);
            } else {
                throw new Error('Share info not available in mock mode');
            }
        },
        enabled: !!shareToken,
    });
};

export const useDownloadSharedPackage = () => {
    return useMutation({
        mutationFn: async (shareToken: string) => {
            if (useRealApi) {
                const response = await PackagesAPI.getSharedPackage(shareToken);
                return PackagesAPI.transformPackageFromBackend(response.data);
            } else {
                throw new Error('Download not available in mock mode');
            }
        },
    });
};
