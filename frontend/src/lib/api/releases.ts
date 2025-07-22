import { apiClient } from './api';

export interface Release {
    id: string;
    package_id: string;
    version: string;
    title?: string;
    changelog?: string;
    file_path: string;
    file_name: string;
    file_size: number;
    file_hash?: string;
    created_at: string;
    updated_at: string;
}

export interface GetReleasesParams {
    packageId: string;
}

export const getReleases = async (params: GetReleasesParams): Promise<{ data: Release[] }> => {
    const response = await apiClient.get(`/api/v1/releases/package/${params.packageId}`);
    return response.data;
};

export const getRelease = async (id: string): Promise<{ data: Release }> => {
    const response = await apiClient.get(`/api/v1/releases/${id}`);
    return response.data;
};

export const createRelease = async (formData: FormData): Promise<{ data: Release }> => {
    const response = await apiClient.post('/api/v1/releases/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const updateRelease = async (id: string, release: Partial<Release>): Promise<{ data: Release }> => {
    const response = await apiClient.put(`/api/v1/releases/${id}`, release);
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

export const getLatestRelease = async (packageId: string): Promise<{ data: Release }> => {
    const response = await apiClient.get(`/api/v1/releases/package/${packageId}/latest`);
    return response.data;
};

export const setLatestRelease = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/v1/releases/${id}/set-latest`);
    return response.data;
};

export const createShareLink = async (releaseId: string, options: { expiryHours?: number }): Promise<{ data: {
    release_id: string;
    share_token: string;
    share_url: string;
    expiry_hours: number;
    file_name: string;
    version: string;
}}> => {
    const response = await apiClient.post(`/api/v1/releases/${releaseId}/share`, {
        expiry_hours: options.expiryHours || 24,
    });
    return response.data;
};

export const getSharedRelease = async (token: string): Promise<{ data: Release }> => {
    const response = await apiClient.get(`/api/v1/releases/share/${token}`);
    return response.data;
};

export const downloadSharedRelease = async (token: string): Promise<Blob> => {
    const response = await apiClient.get(`/api/v1/releases/share/${token}/download`, {
        responseType: 'blob'
    });
    return response.data;
};