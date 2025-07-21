import {apiClient} from "@/lib/api/api";
import {ApiResponse} from "@/types/api-response";
import { User, CreateUserRequest } from '@/types/user';

// 获取所有用户
export async function getUsers(): Promise<ApiResponse<User[]>> {
    const resp = await apiClient.get("/api/v1/user/");
    return resp.data;
}

// 创建用户
export async function createUser(user: CreateUserRequest): Promise<ApiResponse<User>> {
    const resp = await apiClient.post("/api/v1/user/", {
        username: user.username,
        email: user.email,
        password: user.password,
        role: user.role,
        assigned_project_ids: user.assignedProjectIds,
        group_ids: user.groupIds
    });
    return resp.data;
}

// 获取特定用户
export async function getUser(id: string): Promise<ApiResponse<User>> {
    const resp = await apiClient.get(`/api/v1/user/${id}`);
    return resp.data;
}

// 更新用户
export async function updateUser(id: string, update: Partial<User>): Promise<ApiResponse<User>> {
    // 转换前端字段名到后端字段名
    const backendUpdate: any = {};
    if (update.username !== undefined) backendUpdate.username = update.username;
    if (update.email !== undefined) backendUpdate.email = update.email;
    if (update.isActive !== undefined) backendUpdate.is_active = update.isActive;

    const resp = await apiClient.put(`/api/v1/user/${id}`, backendUpdate);
    return resp.data;
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
    return resp.data;
}

// 更新用户资料
export async function updateUserProfile(update: Partial<User>): Promise<ApiResponse<User>> {
    const backendUpdate: any = {};
    if (update.username !== undefined) backendUpdate.username = update.username;
    if (update.email !== undefined) backendUpdate.email = update.email;

    const resp = await apiClient.put("/api/v1/user/profile", backendUpdate);
    return resp.data;
}
