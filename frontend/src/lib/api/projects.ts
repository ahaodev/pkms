import {apiClient} from "@/lib/api/api";
import {ApiResponse} from "@/types/api-response";
import { Project } from "@/types/simplified";

// 获取所有项目
export async function getProjects(): Promise<ApiResponse<Project[]>> {
    const resp = await apiClient.get("/api/v1/projects");
    return resp.data;
}

// 创建项目
export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'packageCount'>): Promise<ApiResponse<Project>> {
    const resp = await apiClient.post("/api/v1/projects", {
        name: project.name,
        description: project.description,
        icon: project.icon || 'package2',
        created_by: project.createdBy,
    });
    return resp.data;
}

// 获取特定项目
export async function getProject(id: string): Promise<ApiResponse<Project>> {
    const resp = await apiClient.get(`/api/v1/projects/${id}`);
    return resp.data;
}

// 更新项目
export async function updateProject(id: string, update: Partial<Project>): Promise<ApiResponse<Project>> {
    // 转换前端字段名到后端字段名
    const backendUpdate: any = {};
    if (update.name !== undefined) backendUpdate.name = update.name;
    if (update.description !== undefined) backendUpdate.description = update.description;
    if (update.icon !== undefined) backendUpdate.icon = update.icon;

    const resp = await apiClient.put(`/api/v1/projects/${id}`, backendUpdate);
    return resp.data;
}

// 删除项目
export async function deleteProject(id: string): Promise<ApiResponse<void>> {
    const resp = await apiClient.delete(`/api/v1/projects/${id}`);
    return resp.data;
}

// 获取项目包列表
export async function getProjectPackages(projectId: string): Promise<ApiResponse<any[]>> {
    const resp = await apiClient.get(`/api/v1/projects/${projectId}/packages`);
    return resp.data;
}

// 获取项目成员
export async function getProjectMembers(projectId: string): Promise<ApiResponse<any[]>> {
    const resp = await apiClient.get(`/api/v1/projects/${projectId}/members`);
    return resp.data;
}

// 添加项目成员
export async function addProjectMember(projectId: string, userId: string): Promise<ApiResponse<void>> {
    const resp = await apiClient.post(`/api/v1/projects/${projectId}/members`, {
        user_id: userId
    });
    return resp.data;
}

// 移除项目成员
export async function removeProjectMember(projectId: string, userId: string): Promise<ApiResponse<void>> {
    const resp = await apiClient.delete(`/api/v1/projects/${projectId}/members/${userId}`);
    return resp.data;
}

// 数据转换函数：后端数据转前端格式
export function transformProjectFromBackend(backendProject: any): Project {
    return {
        id: backendProject.id,
        name: backendProject.name,
        description: backendProject.description,
        icon: backendProject.icon || 'package2',
        createdAt: new Date(backendProject.created_at),
        updatedAt: new Date(backendProject.updated_at),
        packageCount: backendProject.package_count || 0,
        createdBy: backendProject.created_by,
    };
}