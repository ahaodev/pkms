import {apiClient} from './api';
import type {
    Version,
    CreateVersionRequest,
    UpdateVersionRequest,
    CheckUpdateRequest,
    CheckUpdateResponse
} from '@/hooks/use-upgrade';

// Versions API
export const getVersions = async (): Promise<{data: Version[]}> => {
    const response = await apiClient.get('/api/v1/upgrade/versions');
    return response.data;
};

export const getVersionsByPlatform = async (platform: string): Promise<{data: Version[]}> => {
    const response = await apiClient.get(`/api/v1/upgrade/versions?platform=${platform}`);
    return response.data;
};

export const getVersion = async (id: string): Promise<{data: Version}> => {
    const response = await apiClient.get(`/api/v1/upgrade/versions/${id}`);
    return response.data;
};

export const createVersion = async (data: CreateVersionRequest): Promise<{data: Version}> => {
    const response = await apiClient.post('/api/v1/upgrade/versions', data);
    return response.data;
};

export const updateVersion = async (id: string, data: UpdateVersionRequest): Promise<{data: Version}> => {
    const response = await apiClient.put(`/api/v1/upgrade/versions/${id}`, data);
    return response.data;
};

export const deleteVersion = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/upgrade/versions/${id}`);
};

export const publishVersion = async (id: string): Promise<{data: Version}> => {
    const response = await apiClient.patch(`/api/v1/upgrade/versions/${id}/publish`);
    return response.data;
};

export const deprecateVersion = async (id: string): Promise<{data: Version}> => {
    const response = await apiClient.patch(`/api/v1/upgrade/versions/${id}/deprecate`);
    return response.data;
};

// Update check API (for client applications)
export const checkUpdate = async (data: CheckUpdateRequest): Promise<{data: CheckUpdateResponse}> => {
    const response = await apiClient.post('/api/v1/upgrade/check', data);
    return response.data;
};

export const getLatestVersion = async (platform: string): Promise<{data: Version | null}> => {
    const response = await apiClient.get(`/api/v1/upgrade/latest?platform=${platform}`);
    return response.data;
};

// File operations
export const uploadVersionFile = async (versionId: string, file: File): Promise<{data: {downloadUrl: string, fileSize: number}}> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/api/v1/upgrade/versions/${versionId}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

export const downloadVersion = async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/api/v1/upgrade/versions/${id}/download`, {
        responseType: 'blob'
    });
    return response.data;
};

// Statistics
export const getVersionStats = async (): Promise<{data: any}> => {
    const response = await apiClient.get('/api/v1/upgrade/stats');
    return response.data;
};

// Transform functions (if needed for data normalization)
export const transformVersionFromBackend = (version: any): Version => {
    return {
        id: version.id,
        version: version.version,
        versionCode: version.versionCode || version.version_code,
        platform: version.platform,
        status: version.status,
        isForced: version.isForced || version.is_forced || false,
        downloadUrl: version.downloadUrl || version.download_url || '',
        fileSize: version.fileSize || version.file_size || 0,
        changelog: version.changelog || '',
        createdAt: version.createdAt || version.created_at,
        updatedAt: version.updatedAt || version.updated_at,
        downloadCount: version.downloadCount || version.download_count || 0,
    };
};

export const transformVersionToBackend = (version: CreateVersionRequest | UpdateVersionRequest): any => {
    return {
        version: version.version,
        version_code: version.versionCode,
        platform: version.platform,
        status: version.status,
        is_forced: version.isForced,
        download_url: version.downloadUrl,
        file_size: version.fileSize,
        changelog: version.changelog,
    };
};