import {apiClient} from "@/lib/api/api";
import {ApiResponse, PageResponse} from "@/types/api-response";
import { Package, PackageFilters, PackageUpload, UploadProgress } from "@/types/simplified";

// 获取所有包（支持过滤和分页）
export async function getPackages(filters?: PackageFilters): Promise<PageResponse<Package>> {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('project_id', filters.projectId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.isLatest !== undefined) params.append('is_latest', filters.isLatest.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

    const resp = await apiClient.get(`/api/v1/packages/?${params.toString()}`);
    return resp.data;
}

// 创建包（基本信息）
export async function createPackage(pkg: Omit<Package, 'id' | 'createdAt' | 'updatedAt' | 'totalDownloads' | 'releaseCount'>): Promise<ApiResponse<Package>> {
    const resp = await apiClient.post("/api/v1/packages/", {
        project_id: pkg.projectId,
        name: pkg.name,
        description: pkg.description,
        type: pkg.type,
    });
    return resp.data;
}

// 获取特定包
export async function getPackage(id: string): Promise<ApiResponse<Package>> {
    const resp = await apiClient.get(`/api/v1/packages/${id}`);
    return resp.data;
}

// 更新包
export async function updatePackage(id: string, update: Partial<Package>): Promise<ApiResponse<Package>> {
    // 转换前端字段名到后端字段名
    const backendUpdate: any = {};
    if (update.projectId !== undefined) backendUpdate.project_id = update.projectId;
    if (update.name !== undefined) backendUpdate.name = update.name;
    if (update.description !== undefined) backendUpdate.description = update.description;
    if (update.type !== undefined) backendUpdate.type = update.type;

    const resp = await apiClient.put(`/api/v1/packages/${id}`, backendUpdate);
    return resp.data;
}

// 删除包
export async function deletePackage(id: string): Promise<ApiResponse<void>> {
    const resp = await apiClient.delete(`/api/v1/packages/${id}`);
    return resp.data;
}

// 上传包文件和元信息
export async function uploadPackage(
    upload: PackageUpload,
    onProgress?: (progress: UploadProgress) => void
): Promise<ApiResponse<Package>> {
    const formData = new FormData();
    formData.append('file', upload.file);
    formData.append('project_id', upload.projectId);
    formData.append('name', upload.name);
    formData.append('description', upload.description);
    formData.append('type', upload.type);
    formData.append('version', upload.version);
    if (upload.changelog) formData.append('changelog', upload.changelog);
    if (upload.isPublic !== undefined) formData.append('is_public', upload.isPublic.toString());

    const resp = await apiClient.post("/api/v1/packages/upload", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: onProgress ? (progressEvent: any) => {
            const progress: UploadProgress = {
                loaded: progressEvent.loaded || 0,
                total: progressEvent.total || 0,
                percentage: progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0
            };
            onProgress(progress);
        } : undefined
    });
    return resp.data;
}

// 下载包
export async function downloadPackage(id: string): Promise<ApiResponse<{ download_url: string; filename: string; size: number; version: string; checksum: string }>> {
    const resp = await apiClient.get(`/api/v1/packages/${id}/download`);
    return resp.data;
}

// 获取包版本历史
export async function getPackageVersions(id: string): Promise<ApiResponse<Package[]>> {
    const resp = await apiClient.get(`/api/v1/packages/${id}/versions`);
    return resp.data;
}

// 按包名和类型获取版本历史
export async function getPackageVersionsByNameAndType(packageName: string, packageType: string): Promise<ApiResponse<Package[]>> {
    const params = new URLSearchParams();
    params.append('name', packageName);
    params.append('type', packageType);
    // 获取所有版本，不分页
    params.append('pageSize', '1000');
    
    const resp = await apiClient.get(`/api/v1/packages/?${params.toString()}`);
    return resp.data;
}

// 创建分享链接
export async function createShareLink(id: string, options: { expiryHours?: number; isPublic?: boolean }): Promise<ApiResponse<{ package_id: string; share_token: string; share_url: string; expiry_hours: number; is_public: boolean }>> {
    const resp = await apiClient.post(`/api/v1/packages/${id}/share`, {
        expiry_hours: options.expiryHours || 24,
        is_public: options.isPublic || false
    });
    return resp.data;
}

// 通过分享令牌获取包
export async function getSharedPackage(token: string): Promise<ApiResponse<Package>> {
    const resp = await apiClient.get(`/api/v1/packages/share/${token}`);
    return resp.data;
}

// 获取项目的所有包
export async function getPackagesByProject(projectId: string): Promise<ApiResponse<Package[]>> {
    const resp = await apiClient.get(`/api/v1/packages/project/${projectId}`);
    return resp.data;
}

// 数据转换函数：后端数据转前端格式
export function transformPackageFromBackend(backendPackage: any): Package {
    const latestRelease = backendPackage.latest_release ? transformReleaseFromBackend(backendPackage.latest_release) : undefined;
    
    return {
        id: backendPackage.id,
        projectId: backendPackage.project_id,
        name: backendPackage.name,
        description: backendPackage.description,
        type: backendPackage.type as Package['type'],
        createdAt: new Date(backendPackage.created_at),
        updatedAt: new Date(backendPackage.updated_at),
        // icon: backendPackage.icon,
        // homepage: backendPackage.homepage,
        // repository: backendPackage.repository,
        // totalDownloads: backendPackage.total_downloads || backendPackage.download_count || 0,
        releaseCount: backendPackage.release_count || 0,
        latestRelease,
        
        // 向后兼容字段
        version: latestRelease?.version,
        fileSize: latestRelease?.fileSize,
        fileName: latestRelease?.fileName,
        changelog: latestRelease?.changelog,
        checksum: latestRelease?.checksum,
        downloadCount: backendPackage.total_downloads || backendPackage.download_count || 0,
        isLatest: latestRelease?.isLatest,
        
        isPublic: backendPackage.is_public || false,
        createdBy: backendPackage.created_by || 'unknown'
    } as Package;
}

// 数据转换函数：Release 后端数据转前端格式
export function transformReleaseFromBackend(backendRelease: any): any {
    return {
        id: backendRelease.id,
        packageId: backendRelease.package_id,
        version: backendRelease.version,
        title: backendRelease.title,
        description: backendRelease.description,
        changelog: backendRelease.changelog,
        fileUrl: backendRelease.file_url,
        fileName: backendRelease.file_name,
        fileSize: backendRelease.file_size || 0,
        checksum: backendRelease.checksum,
        versionCode: backendRelease.version_code || 0,
        isPrerelease: backendRelease.is_prerelease || false,
        isDraft: backendRelease.is_draft || false,
        isLatest: backendRelease.is_latest || false,
        minSdkVersion: backendRelease.min_sdk_version,
        targetSdkVersion: backendRelease.target_sdk_version,
        downloadCount: backendRelease.download_count || 0,
        createdAt: new Date(backendRelease.created_at),
        updatedAt: new Date(backendRelease.updated_at),
        shareToken: backendRelease.share_token,
        shareExpiry: backendRelease.share_expiry ? new Date(backendRelease.share_expiry) : undefined,
        isPublic: backendRelease.is_public || false,
        createdBy: backendRelease.created_by || 'unknown'
    };
}
