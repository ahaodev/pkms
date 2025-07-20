import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {apiClient} from '@/lib/api/api';

export interface Version {
    id: string;
    version: string;
    versionCode: number;
    platform: 'android' | 'ios' | 'windows' | 'web';
    status: 'draft' | 'published' | 'deprecated';
    isForced: boolean;
    downloadUrl: string;
    fileSize: number;
    changelog: string;
    createdAt: string;
    updatedAt: string;
    downloadCount: number;
}

export interface CreateVersionRequest {
    version: string;
    versionCode: number;
    platform: string;
    status: string;
    isForced: boolean;
    downloadUrl: string;
    fileSize: number;
    changelog: string;
}

export interface UpdateVersionRequest extends Partial<CreateVersionRequest> {}

export interface CheckUpdateRequest {
    platform: string;
    currentVersion: string;
    currentVersionCode: number;
}

export interface CheckUpdateResponse {
    hasUpdate: boolean;
    isForced: boolean;
    latestVersion?: Version;
    downloadUrl?: string;
    changelog?: string;
}

// Fetch all versions
export const useVersions = () => {
    return useQuery({
        queryKey: ['versions'],
        queryFn: async (): Promise<Version[]> => {
            const response = await apiClient.get('/api/v1/upgrade/versions');
            return response.data.data || [];
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    });
};

// Fetch versions by platform
export const useVersionsByPlatform = (platform: string) => {
    return useQuery({
        queryKey: ['versions', platform],
        queryFn: async (): Promise<Version[]> => {
            const response = await apiClient.get(`/api/v1/upgrade/versions?platform=${platform}`);
            return response.data.data || [];
        },
        enabled: !!platform,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    });
};

// Fetch single version
export const useVersion = (id: string) => {
    return useQuery({
        queryKey: ['version', id],
        queryFn: async (): Promise<Version> => {
            const response = await apiClient.get(`/api/v1/upgrade/versions/${id}`);
            return response.data.data;
        },
        enabled: !!id,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    });
};

// Create version
export const useCreateVersion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateVersionRequest): Promise<Version> => {
            const response = await apiClient.post('/api/v1/upgrade/versions', data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['versions']});
        },
    });
};

// Update version
export const useUpdateVersion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({id, data}: {id: string, data: UpdateVersionRequest}): Promise<Version> => {
            const response = await apiClient.put(`/api/v1/upgrade/versions/${id}`, data);
            return response.data.data;
        },
        onSuccess: (_, {id}) => {
            queryClient.invalidateQueries({queryKey: ['versions']});
            queryClient.invalidateQueries({queryKey: ['version', id]});
        },
    });
};

// Delete version
export const useDeleteVersion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string): Promise<void> => {
            await apiClient.delete(`/api/v1/upgrade/versions/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['versions']});
        },
    });
};

// Publish version
export const usePublishVersion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string): Promise<Version> => {
            const response = await apiClient.patch(`/api/v1/upgrade/versions/${id}/publish`);
            return response.data.data;
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({queryKey: ['versions']});
            queryClient.invalidateQueries({queryKey: ['version', id]});
        },
    });
};

// Deprecate version
export const useDeprecateVersion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string): Promise<Version> => {
            const response = await apiClient.patch(`/api/v1/upgrade/versions/${id}/deprecate`);
            return response.data.data;
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({queryKey: ['versions']});
            queryClient.invalidateQueries({queryKey: ['version', id]});
        },
    });
};

// Check for updates (for client applications)
export const useCheckUpdate = () => {
    return useMutation({
        mutationFn: async (data: CheckUpdateRequest): Promise<CheckUpdateResponse> => {
            const response = await apiClient.post('/api/v1/upgrade/check', data);
            return response.data.data;
        },
    });
};

// Get latest version by platform
export const useLatestVersion = (platform: string) => {
    return useQuery({
        queryKey: ['latest-version', platform],
        queryFn: async (): Promise<Version | null> => {
            const response = await apiClient.get(`/api/v1/upgrade/latest?platform=${platform}`);
            return response.data.data || null;
        },
        enabled: !!platform,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    });
};

// Download version file
export const useDownloadVersion = () => {
    return useMutation({
        mutationFn: async (id: string): Promise<string> => {
            const response = await apiClient.get(`/api/v1/upgrade/versions/${id}/download`, {
                responseType: 'blob'
            });
            
            // Create download URL
            const blob = new Blob([response.data]);
            const downloadUrl = window.URL.createObjectURL(blob);
            
            return downloadUrl;
        },
    });
};

// Get version statistics
export const useVersionStats = () => {
    return useQuery({
        queryKey: ['version-stats'],
        queryFn: async () => {
            const response = await apiClient.get('/api/v1/upgrade/stats');
            return response.data.data;
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    });
};

// Upload version file
export const useUploadVersionFile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({versionId, file}: {versionId: string, file: File}): Promise<{downloadUrl: string, fileSize: number}> => {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post(`/api/v1/upgrade/versions/${versionId}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data.data;
        },
        onSuccess: (_, {versionId}) => {
            queryClient.invalidateQueries({queryKey: ['versions']});
            queryClient.invalidateQueries({queryKey: ['version', versionId]});
        },
    });
};