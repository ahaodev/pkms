import {Release, ReleaseFilters, ApiResponse, PaginatedResponse} from '@/types';

export interface ReleaseService {
    // Release CRUD operations
    getReleases(filters?: ReleaseFilters): Promise<ApiResponse<PaginatedResponse<Release>>>;

    getRelease(id: string): Promise<ApiResponse<Release>>;

    createRelease(release: Omit<Release, 'id' | 'createdAt'>): Promise<ApiResponse<Release>>;

    updateRelease(id: string, release: Partial<Release>): Promise<ApiResponse<Release>>;

    deleteRelease(id: string): Promise<ApiResponse<void>>;

    // Release actions
    promoteRelease(id: string, targetEnvironment: Release['environment']): Promise<ApiResponse<Release>>;

    approveRelease(id: string): Promise<ApiResponse<Release>>;

    rejectRelease(id: string, reason: string): Promise<ApiResponse<Release>>;
}
