import {apiClient} from "@/lib/api/api";
import {ApiResponse} from "@/types/api-response";

// 权限类型
export interface Permission {
    id: string;
    userId?: string;
    groupId?: string;
    projectId: string;
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canManageMembers: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// 权限检查请求
export interface PermissionCheckRequest {
    userId: string;
    projectId: string;
    action: 'view' | 'edit' | 'delete' | 'manage_members';
}

// 权限检查响应
export interface PermissionCheckResponse {
    allowed: boolean;
    reason?: string;
}

// 获取用户权限
export async function getUserPermissions(userId: string): Promise<ApiResponse<Permission[]>> {
    const resp = await apiClient.get(`/api/v1/permission/users/${userId}`);
    return resp.data;
}

// 设置用户权限
export async function setUserPermissions(userId: string, permissions: Omit<Permission, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]): Promise<ApiResponse<void>> {
    const backendPermissions = permissions.map(p => ({
        project_id: p.projectId,
        can_view: p.canView,
        can_edit: p.canEdit,
        can_delete: p.canDelete,
        can_manage_members: p.canManageMembers
    }));

    const resp = await apiClient.post(`/api/v1/permission/users/${userId}`, {
        permissions: backendPermissions
    });
    return resp.data;
}

// 移除用户权限
export async function removeUserPermission(userId: string, projectId: string): Promise<ApiResponse<void>> {
    const resp = await apiClient.delete(`/api/v1/permission/users/${userId}/projects/${projectId}`);
    return resp.data;
}

// 获取组权限
export async function getGroupPermissions(groupId: string): Promise<ApiResponse<Permission[]>> {
    const resp = await apiClient.get(`/api/v1/permission/groups/${groupId}`);
    return resp.data;
}

// 设置组权限
export async function setGroupPermissions(groupId: string, permissions: Omit<Permission, 'id' | 'groupId' | 'createdAt' | 'updatedAt'>[]): Promise<ApiResponse<void>> {
    const backendPermissions = permissions.map(p => ({
        project_id: p.projectId,
        can_view: p.canView,
        can_edit: p.canEdit,
        can_delete: p.canDelete,
        can_manage_members: p.canManageMembers
    }));

    const resp = await apiClient.post(`/api/v1/permission/groups/${groupId}`, {
        permissions: backendPermissions
    });
    return resp.data;
}

// 移除组权限
export async function removeGroupPermission(groupId: string, projectId: string): Promise<ApiResponse<void>> {
    const resp = await apiClient.delete(`/api/v1/permission/groups/${groupId}/projects/${projectId}`);
    return resp.data;
}

// 获取项目权限
export async function getProjectPermissions(projectId: string): Promise<ApiResponse<Permission[]>> {
    const resp = await apiClient.get(`/api/v1/permission/projects/${projectId}`);
    return resp.data;
}

// 检查权限
export async function checkPermission(request: PermissionCheckRequest): Promise<ApiResponse<PermissionCheckResponse>> {
    const resp = await apiClient.post("/api/v1/permission/check", {
        user_id: request.userId,
        project_id: request.projectId,
        action: request.action
    });
    return resp.data;
}

// 数据转换函数：后端数据转前端格式
export function transformPermissionFromBackend(backendPermission: any): Permission {
    return {
        id: backendPermission.id,
        userId: backendPermission.user_id,
        groupId: backendPermission.group_id,
        projectId: backendPermission.project_id,
        canView: backendPermission.can_view,
        canEdit: backendPermission.can_edit,
        canDelete: backendPermission.can_delete,
        canManageMembers: backendPermission.can_manage_members,
        createdAt: new Date(backendPermission.created_at),
        updatedAt: new Date(backendPermission.updated_at)
    };
}
