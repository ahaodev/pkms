import {apiClient} from "@/lib/api/api";
import {ApiResponse, PagedResult} from "@/types/api-response";
import {Package, PackageFilters} from '@/types/package';
import {Release, ReleaseUpload, UploadProgress} from '@/types/release';

// 获取所有包（支持过滤和分页）
export async function getPackages(filters?: PackageFilters): Promise<PagedResult<Package>> {
    const params = new URLSearchParams();
    
    // Only add project_id if it's explicitly provided and not empty
    if (filters?.projectId && filters.projectId.trim() !== '') {
        params.append('project_id', filters.projectId);
    }
    
    if (filters?.type) params.append('type', filters.type);
    if (filters?.isLatest !== undefined) params.append('is_latest', filters.isLatest.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('page_size', filters.pageSize.toString());

    const url = `/api/v1/packages/?${params.toString()}`;
    
    const resp = await apiClient.get(url);
    return resp.data.data;
}

// 创建包（基本信息）
export async function createPackage(pkg: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Package>> {
    const resp = await apiClient.post("/api/v1/packages/", {
        project_id: pkg.projectId,
        name: pkg.name,
        description: pkg.description,
        type: pkg.type,
    });
    return resp.data;
}

// 删除包
export async function deletePackage(id: string): Promise<ApiResponse<void>> {
    const resp = await apiClient.delete(`/api/v1/packages/${id}`);
    return resp.data;
}
// 上传包文件和元信息
export async function uploadRelease(
    upload: ReleaseUpload,
    onProgress?: (progress: UploadProgress) => void
): Promise<ApiResponse<Package>> {
    const formData = new FormData();
    formData.append('file', upload.file);
    formData.append('package_id', upload.package_id);
    formData.append('version_code', upload.version_code);
    formData.append('version_name', upload.version_name);
    if (upload.tag_name) formData.append('tag_name', upload.tag_name);
    if (upload.changelog) formData.append('changelog', upload.changelog);

    const resp = await apiClient.post("/api/v1/releases/", formData, {
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

// 数据转换函数：后端数据转前端格式
export function transformPackageFromBackend(backendPackage: any): Package {
    return {
        id: backendPackage.id,
        projectId: backendPackage.project_id,
        name: backendPackage.name,
        description: backendPackage.description,
        type: backendPackage.type as Package['type'],
        createdAt: new Date(backendPackage.created_at),
        updatedAt: new Date(backendPackage.updated_at),
        createdBy: backendPackage.created_by || 'unknown'
    } as Package;
}

// 数据转换函数：Release 后端数据转前端格式
export function transformReleaseFromBackend(backendRelease: any): Release {
    return {
        id: backendRelease.id,
        package_id: backendRelease.package_id,
        version_code: backendRelease.version_code,
        version_name: backendRelease.version_name,
        tag_name: backendRelease.tag_name,
        changelog: backendRelease.changelog,
        file_path: backendRelease.file_path,
        file_name: backendRelease.file_name,
        file_size: backendRelease.file_size || 0,
        file_hash: backendRelease.file_hash,
        download_count: backendRelease.download_count || 0,
        created_at: new Date(backendRelease.created_at),
        share_token: backendRelease.share_token,
        share_expiry: backendRelease.share_expiry ? new Date(backendRelease.share_expiry) : undefined,
        created_by: backendRelease.created_by || 'unknown'
    };
}

// 获取特定包的所有发布版本（支持分页）
export async function getPackageReleases(packageId: string, page: number = 1, pageSize: number = 20): Promise<PagedResult<Release>> {
    const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString()
    });
    
    const resp = await apiClient.get(`/api/v1/releases/package/${packageId}?${params.toString()}`);
    
    // Transform the backend data to frontend format
    const releases = (resp.data.data.list || []).map(transformReleaseFromBackend);
    
    return {
        list: releases,
        total: resp.data.data.total || 0,
        page: resp.data.data.page || page,
        page_size: resp.data.data.page_size || pageSize,
        total_pages: resp.data.data.total_pages || Math.ceil((resp.data.data.total || 0) / pageSize)
    };
}

// 获取特定包的所有发布版本（不分页，保持向后兼容）
export async function getPackageReleasesAll(packageId: string): Promise<ApiResponse<Release[]>> {
    const resp = await apiClient.get(`/api/v1/releases/package/${packageId}`);
    
    // Transform the backend data to frontend format - backend always returns paginated structure
    const releases = (resp.data.data.list || []).map(transformReleaseFromBackend);
    
    return {
        ...resp.data,
        data: releases
    };
}
