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
    const response = await apiClient.get(`/api/v1/packages/release/${params.packageId}`);
    return response.data;
};

export const getRelease = async (id: string): Promise<{ data: Release }> => {
    const response = await apiClient.get(`/api/v1/releases/${id}`);
    return response.data;
};