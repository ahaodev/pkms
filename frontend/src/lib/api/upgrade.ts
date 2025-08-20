import { apiClient } from './api';
import { PagedResult } from '@/types/api-response';

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
    version_code?: number;
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


// 升级目标 CRUD API
export const getUpgradeTargets = async (filters?: {
    project_id?: string;
    package_id?: string;
    is_active?: boolean;
    page?: number;
    pageSize?: number;
}): Promise<{ data: PagedResult<UpgradeTarget>; code: number; msg: string; }> => {
    const params = new URLSearchParams();
    if (filters?.project_id) params.append('project_id', filters.project_id);
    if (filters?.package_id) params.append('package_id', filters.package_id);
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('page_size', filters.pageSize.toString());

    const response = await apiClient.get(`/api/v1/upgrades?${params.toString()}`);
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