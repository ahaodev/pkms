import {apiClient} from "@/lib/api/api";
import {ApiResponse} from "@/types/api-response";
import { User, CreateUserRequest, UpdateUserRequest, ProfileUpdateRequest } from '@/types/user';

// Transform backend user data to frontend format
function transformUserFromBackend(backendUser: any): User {
    return {
        id: backendUser.id,
        name: backendUser.name,
        tenants: backendUser.tenants,
        is_active: backendUser.is_active ?? true,
        created_at: backendUser.created_at ? new Date(backendUser.created_at) : new Date(),
        updated_at: backendUser.updated_at ? new Date(backendUser.updated_at) : new Date(),
    };
}

// 获取所有用户
export async function getUsers(): Promise<ApiResponse<User[]>> {
    const resp = await apiClient.get("/api/v1/user/");
    const transformedData = {
        ...resp.data,
        data: resp.data.data.map(transformUserFromBackend)
    };
    return transformedData;
}

// 创建用户
export async function createUser(user: CreateUserRequest): Promise<ApiResponse<User>> {
    const resp = await apiClient.post("/api/v1/user/", {
        name: user.name,
        password: user.password,
        is_active: user.is_active ?? true
    });
    const transformedData = {
        ...resp.data,
        data: transformUserFromBackend(resp.data.data)
    };
    return transformedData;
}

// 获取特定用户
export async function getUser(id: string): Promise<ApiResponse<User>> {
    const resp = await apiClient.get(`/api/v1/user/${id}`);
    const transformedData = {
        ...resp.data,
        data: transformUserFromBackend(resp.data.data)
    };
    return transformedData;
}

// 更新用户
export async function updateUser(id: string, update: UpdateUserRequest): Promise<ApiResponse<User>> {
    const resp = await apiClient.put(`/api/v1/user/${id}`, update);
    const transformedData = {
        ...resp.data,
        data: transformUserFromBackend(resp.data.data)
    };
    return transformedData;
}

// 删除用户
export async function deleteUser(id: string): Promise<ApiResponse<void>> {
    const resp = await apiClient.delete(`/api/v1/user/${id}`);
    return resp.data;
}

// 获取用户的项目
export async function getUserProjects(userId: string): Promise<ApiResponse<any[]>> {
    const resp = await apiClient.get(`/api/v1/user/${userId}/projects`);
    return resp.data;
}

// 获取用户的组
export async function getUserGroups(userId: string): Promise<ApiResponse<any[]>> {
    const resp = await apiClient.get(`/api/v1/user/${userId}/groups`);
    return resp.data;
}

// 分配用户到项目
export async function assignUserToProject(userId: string, projectId: string): Promise<ApiResponse<void>> {
    const resp = await apiClient.post(`/api/v1/user/${userId}/projects`, {
        project_id: projectId
    });
    return resp.data;
}

// 从项目中移除用户
export async function unassignUserFromProject(userId: string, projectId: string): Promise<ApiResponse<void>> {
    const resp = await apiClient.delete(`/api/v1/user/${userId}/projects/${projectId}`);
    return resp.data;
}

// 获取用户资料
export async function getUserProfile(): Promise<ApiResponse<User>> {
    const resp = await apiClient.get("/api/v1/user/profile");
    const transformedData = {
        ...resp.data,
        data: transformUserFromBackend(resp.data.data)
    };
    return transformedData;
}

// 更新用户资料
export async function updateUserProfile(update: ProfileUpdateRequest): Promise<ApiResponse<any>> {
    const resp = await apiClient.put("/api/v1/user/profile", update);
    return resp.data;
}
