import {apiClient} from "@/lib/api/api";
import {ApiResponse, PagedResult} from "@/types/api-response";
import {CreateUserRequest, UpdateUserRequest, User} from '@/types/user';

// Transform backend user data to frontend format
function transformUserFromBackend(backendUser: any): User {
    return {
        id: backendUser.id,
        name: backendUser.name,
        tenants: backendUser.tenants,
        is_active: backendUser.is_active !== undefined ? backendUser.is_active : true,
        created_at: backendUser.created_at ? new Date(backendUser.created_at) : new Date(),
        updated_at: backendUser.updated_at ? new Date(backendUser.updated_at) : new Date(),
    };
}

// 获取所有用户 (分页)
export async function getUsers(page: number = 1, pageSize: number = 20): Promise<ApiResponse<PagedResult<User>>> {
    const resp = await apiClient.get("/api/v1/user/", {
        params: {
            page,
            page_size: pageSize
        }
    });

    // Backend now returns PagedResult structure
    const transformedData = {
        ...resp.data,
        data: {
            ...resp.data.data,
            list: resp.data.data.list.map(transformUserFromBackend)
        }
    };
    return transformedData;
}

// 创建用户
export async function createUser(user: CreateUserRequest): Promise<ApiResponse<User>> {
    const resp = await apiClient.post("/api/v1/user/", {
        name: user.name,
        password: user.password,
        is_active: user.is_active ?? true,
        create_tenant: user.create_tenant ?? true
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

// 更新用户密码
export async function updateUserPassword(passwordUpdate: {
    current_password: string;
    new_password: string;
}): Promise<ApiResponse<any>> {
    const resp = await apiClient.put("/api/v1/profile/password", passwordUpdate);
    return resp.data;
}
