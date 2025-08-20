import {apiClient} from './api';
import type {
    ClientAccess,
    ClientAccessFilters,
    CreateClientAccessRequest,
    UpdateClientAccessRequest
} from '@/types/client-access';
import type {ApiResponse, PagedResult} from '@/types/api-response';

export const clientAccessApi = {
    // 获取客户端接入列表 (分页)
    getList: (filters?: ClientAccessFilters, page: number = 1, pageSize: number = 20): Promise<PagedResult<ClientAccess>> => {
        const params = new URLSearchParams();
        if (filters?.project_id) params.append('project_id', filters.project_id);
        if (filters?.package_id) params.append('package_id', filters.package_id);
        if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
        if (filters?.search) params.append('search', filters.search);
        params.append('page', page.toString());
        params.append('page_size', pageSize.toString());

        return apiClient
            .get<ApiResponse<PagedResult<ClientAccess>>>(`/api/v1/access-manager?${params.toString()}`)
            .then(res => res.data.data);
    },
    // 创建客户端接入
    create: (data: CreateClientAccessRequest): Promise<ClientAccess> =>
        apiClient
            .post<ApiResponse<ClientAccess>>('/api/v1/access-manager', data)
            .then(res => res.data.data),

    // 更新客户端接入
    update: (id: string, data: UpdateClientAccessRequest): Promise<void> =>
        apiClient
            .put<ApiResponse<void>>(`/api/v1/access-manager/${id}`, data)
            .then(res => res.data.data),

    // 删除客户端接入
    delete: (id: string): Promise<void> =>
        apiClient
            .delete<ApiResponse<void>>(`/api/v1/access-manager/${id}`)
            .then(res => res.data.data),

    // 重新生成访问令牌
    regenerateToken: (id: string): Promise<{ access_token: string }> =>
        apiClient
            .post<ApiResponse<{ access_token: string }>>(`/api/v1/access-manager/${id}/regenerate`)
            .then(res => res.data.data),

    // 启用/禁用客户端接入
    toggleStatus: (id: string, isActive: boolean): Promise<void> =>
        apiClient
            .put<ApiResponse<void>>(`/api/v1/access-manager/${id}`, {is_active: isActive})
            .then(res => res.data.data),
};