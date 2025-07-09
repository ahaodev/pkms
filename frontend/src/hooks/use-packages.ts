import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Package, PackageFilters, PackageUpload, UploadProgress} from '@/types/simplified';
import {MockPackageService} from '@/services/implementations/simplified-mock.service';
import {useAuth} from '@/contexts/simple-auth-context';

const packageService = new MockPackageService();

export const usePackages = (filters?: PackageFilters) => {
    const {user, isAdmin, canAccessProject} = useAuth();
    
    return useQuery({
        queryKey: ['packages', filters, user?.id],
        queryFn: () => packageService.getPackages(filters),
        select: (response) => {
            if (!user) return [];
            
            // 管理员可以看到所有包
            if (isAdmin()) {
                return response.data.items;
            }
            
            // 普通用户只能看到有权限访问的项目的包
            return response.data.items.filter((pkg: Package) => 
                canAccessProject(pkg.projectId) || 
                pkg.isPublic
            );
        },
    });
};

export const usePackage = (id: string) => {
    return useQuery({
        queryKey: ['package', id],
        queryFn: () => packageService.getPackage(id),
        select: (response) => response.data,
        enabled: !!id,
    });
};

export const usePackagesByProject = (projectId: string) => {
    const {user, isAdmin, canAccessProject} = useAuth();
    
    return useQuery({
        queryKey: ['packages', 'project', projectId, user?.id],
        queryFn: () => packageService.getPackagesByProject(projectId),
        select: (response) => {
            if (!user) return [];
            
            // 管理员可以看到所有包
            if (isAdmin()) {
                return response.data;
            }
            
            // 普通用户只能看到有权限访问的项目的包
            if (canAccessProject(projectId)) {
                return response.data;
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
        mutationFn: (upload: PackageUpload) => packageService.uploadPackage(upload, onProgress),
        onSuccess: (_, upload) => {
            queryClient.invalidateQueries({queryKey: ['packages']});
            queryClient.invalidateQueries({queryKey: ['packages', 'project', upload.projectId]});
        },
    });
};

export const useUpdatePackage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, update}: { id: string; update: Partial<Package> }) =>
            packageService.updatePackage(id, update),
        onSuccess: (_, {id}) => {
            queryClient.invalidateQueries({queryKey: ['packages']});
            queryClient.invalidateQueries({queryKey: ['package', id]});
        },
    });
};

export const useDeletePackage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => packageService.deletePackage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['packages']});
        },
    });
};

export const useCheckVersion = () => {
    return useMutation({
        mutationFn: ({packageId, currentVersion}: {
            packageId: string;
            currentVersion: string;
        }) => packageService.checkVersion(packageId, currentVersion),
    });
};

export const useVersionHistory = (packageId: string) => {
    return useQuery({
        queryKey: ['package', packageId, 'versions'],
        queryFn: () => packageService.getVersionHistory(packageId),
        select: (response) => response.data,
        enabled: !!packageId,
    });
};

export const useGenerateShareLink = () => {
    return useMutation({
        mutationFn: ({packageId, expiresIn}: { packageId: string; expiresIn?: number }) =>
            packageService.generateShareLink(packageId, expiresIn),
    });
};

export const useShareInfo = (shareToken: string) => {
    return useQuery({
        queryKey: ['share', shareToken],
        queryFn: () => packageService.getShareInfo(shareToken),
        select: (response) => response.data,
        enabled: !!shareToken,
    });
};

export const useDownloadSharedPackage = () => {
    return useMutation({
        mutationFn: (shareToken: string) => packageService.downloadSharedPackage(shareToken),
    });
};
