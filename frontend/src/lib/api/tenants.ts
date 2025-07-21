import {apiClient} from "@/lib/api/api";
import {ApiResponse} from "@/types/api-response";
import { Tenant, CreateTenantRequest, UpdateTenantRequest } from '@/types/tenant';

// Transform backend tenant data to frontend format
function transformTenantFromBackend(backendTenant: any): Tenant {
    return {
        id: backendTenant.id,
        name: backendTenant.name,
        created_at: backendTenant.created_at ? new Date(backendTenant.created_at) : new Date(),
        updated_at: backendTenant.updated_at ? new Date(backendTenant.updated_at) : new Date(),
    };
}

// 获取所有租户
export async function getTenants(): Promise<ApiResponse<Tenant[]>> {
    const resp = await apiClient.get("/api/v1/tenants/");
    const transformedData = {
        ...resp.data,
        data: resp.data.data.map(transformTenantFromBackend)
    };
    return transformedData;
}

// 创建租户
export async function createTenant(tenant: CreateTenantRequest): Promise<ApiResponse<Tenant>> {
    const resp = await apiClient.post("/api/v1/tenants/", {
        name: tenant.name,
    });
    const transformedData = {
        ...resp.data,
        data: transformTenantFromBackend(resp.data.data)
    };
    return transformedData;
}

// 获取特定租户
export async function getTenant(id: string): Promise<ApiResponse<Tenant>> {
    const resp = await apiClient.get(`/api/v1/tenants/${id}`);
    const transformedData = {
        ...resp.data,
        data: transformTenantFromBackend(resp.data.data)
    };
    return transformedData;
}

// 更新租户
export async function updateTenant(id: string, update: UpdateTenantRequest): Promise<ApiResponse<Tenant>> {
    const resp = await apiClient.put(`/api/v1/tenants/${id}`, update);
    const transformedData = {
        ...resp.data,
        data: transformTenantFromBackend(resp.data.data)
    };
    return transformedData;
}

// 删除租户
export async function deleteTenant(id: string): Promise<ApiResponse<void>> {
    const resp = await apiClient.delete(`/api/v1/tenants/${id}`);
    return resp.data;
}

// 获取租户用户
export async function getTenantUsers(tenantId: string): Promise<ApiResponse<any[]>> {
    const resp = await apiClient.get(`/api/v1/tenants/${tenantId}/users`);
    return resp.data;
}

// 添加用户到租户
export async function addUserToTenant(tenantId: string, userId: string): Promise<ApiResponse<void>> {
    const resp = await apiClient.post(`/api/v1/tenants/${tenantId}/users`, {
        user_id: userId
    });
    return resp.data;
}

// 从租户中移除用户
export async function removeUserFromTenant(tenantId: string, userId: string): Promise<ApiResponse<void>> {
    const resp = await apiClient.delete(`/api/v1/tenants/${tenantId}/users/${userId}`);
    return resp.data;
}