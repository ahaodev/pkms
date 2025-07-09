import {
    Project,
    Package,
    PackageFilters,
    VersionInfo,
    ShareInfo,
    ApiResponse,
    PaginatedResponse,
    PackageUpload,
    UploadProgress
} from '@/types/simplified';

export interface ProjectService {
    getProjects(): Promise<ApiResponse<Project[]>>;

    getProject(id: string): Promise<ApiResponse<Project>>;

    createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'packageCount'>): Promise<ApiResponse<Project>>;

    updateProject(id: string, project: Partial<Project>): Promise<ApiResponse<Project>>;

    deleteProject(id: string): Promise<ApiResponse<void>>;
}

export interface PackageService {
    getPackages(filters?: PackageFilters): Promise<ApiResponse<PaginatedResponse<Package>>>;

    getPackage(id: string): Promise<ApiResponse<Package>>;

    getPackagesByProject(projectId: string): Promise<ApiResponse<Package[]>>;

    uploadPackage(
        upload: PackageUpload,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<ApiResponse<Package>>;

    updatePackage(id: string, update: Partial<Package>): Promise<ApiResponse<Package>>;

    deletePackage(id: string): Promise<ApiResponse<void>>;

    // 版本相关
    checkVersion(packageId: string, currentVersion: string): Promise<ApiResponse<VersionInfo>>;

    getVersionHistory(packageId: string): Promise<ApiResponse<Package[]>>;

    // 分享相关
    generateShareLink(packageId: string, expiresIn?: number): Promise<ApiResponse<ShareInfo>>;

    getShareInfo(shareToken: string): Promise<ApiResponse<ShareInfo>>;

    downloadSharedPackage(shareToken: string): Promise<ApiResponse<{ downloadUrl: string }>>;
}
