import { apiClient } from './api';

// 升级目标类型定义
export interface UpgradeTarget {
    id: string;
    tenant_id: string;
    project_id: string;
    package_id: string;
    release_id: string;
    name: string;
    description: string;
    is_active: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
    // 关联信息
    project_name?: string;
    package_name?: string;
    package_type?: string;
    version?: string;
    file_name?: string;
    file_size?: number;
    file_hash?: string;
    download_url?: string;
}

export interface CreateUpgradeTargetRequest {
    project_id: string;
    package_id: string;
    release_id: string;
    name: string;
    description?: string;
}

export interface UpdateUpgradeTargetRequest {
    name?: string;
    description?: string;
    is_active?: boolean;
}

export interface CheckUpdateRequest {
    project_id: string;
    package_id: string;
    current_version: string;
}

export interface CheckUpdateResponse {
    has_update: boolean;
    current_version: string;
    latest_version: string;
    download_url?: string;
    file_size?: number;
    file_hash?: string;
    changelog?: string;
    release_notes?: string;
}

// 升级目标 CRUD API
export const getUpgradeTargets = async (filters?: {
    project_id?: string;
    package_id?: string;
    is_active?: boolean;
}): Promise<{ data: UpgradeTarget[] }> => {
    const params = new URLSearchParams();
    if (filters?.project_id) params.append('project_id', filters.project_id);
    if (filters?.package_id) params.append('package_id', filters.package_id);
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());

    const response = await apiClient.get(`/api/v1/upgrades?${params.toString()}`);
    return response.data;
};

export const getUpgradeTarget = async (id: string): Promise<{ data: UpgradeTarget }> => {
    const response = await apiClient.get(`/api/v1/upgrades/${id}`);
    return response.data;
};

export const createUpgradeTarget = async (data: CreateUpgradeTargetRequest): Promise<{ data: UpgradeTarget }> => {
    const response = await apiClient.post('/api/v1/upgrades', data);
    return response.data;
};

export const updateUpgradeTarget = async (id: string, data: UpdateUpgradeTargetRequest): Promise<{ data: string }> => {
    const response = await apiClient.put(`/api/v1/upgrades/${id}`, data);
    return response.data;
};

export const deleteUpgradeTarget = async (id: string): Promise<{ data: string }> => {
    const response = await apiClient.delete(`/api/v1/upgrades/${id}`);
    return response.data;
};

// 检查更新 API (供客户端调用)
export const checkUpdate = async (data: CheckUpdateRequest): Promise<{ data: CheckUpdateResponse }> => {
    const response = await apiClient.post('/api/v1/upgrades/check', data);
    return response.data;
};

// 获取项目的所有升级目标
export const getProjectUpgradeTargets = async (projectId: string): Promise<{ data: UpgradeTarget[] }> => {
    const response = await apiClient.get(`/api/v1/upgrades/projects/${projectId}`);
    return response.data;
};