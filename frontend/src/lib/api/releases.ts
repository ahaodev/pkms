import { apiClient } from './api';

export interface Release {
    id: string;
    package_id: string;
    version_code: string;
    version_name?: string;
    changelog?: string;
    file_path: string;
    file_name: string;
    file_size: number;
    file_hash?: string;
    download_count: number;
    share_expiry: string;
    created_by: string;
    created_at: string;
}

export interface GetReleasesParams {
    packageId: string;
}

export const getReleases = async (params: GetReleasesParams): Promise<{
    data: {
        list: Release[],
        total: number,
        page: number,
        page_size: number,
        total_pages: number
    }
}> => {
    const response = await apiClient.get(`/api/v1/releases/package/${params.packageId}`);
    return response.data;
};

export const deleteRelease = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/v1/releases/${id}`);
    return response.data;
};

export const downloadRelease = async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/api/v1/releases/${id}/download`, {
        responseType: 'blob'
    });
    return response.data;
};
export const createShareLink = async (releaseId: string, options: { expiryHours?: number }): Promise<{ data: {
    id: string;
    code: string;
    share_url: string;
    release_id: string;
    expiry_hours: number;
    file_name: string;
    version: string;
    start_at: string;
    expired_at?: string;
}}> => {
    const response = await apiClient.post(`/api/v1/releases/${releaseId}/share`, {
        expiry_hours: options.expiryHours || 24,
    });
    return response.data;
};