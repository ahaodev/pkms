import {apiClient} from "@/lib/api/api";
import {ApiResponse, PagedResult} from "@/types/api-response";
import { Project } from '@/types/project';

// 获取所有项目 (分页)
export async function getProjects(page: number = 1, pageSize: number = 20): Promise<ApiResponse<PagedResult<Project>>> {
    const resp = await apiClient.get("/api/v1/projects", {
        params: {
            page,
            page_size: pageSize
        }
    });
    
    // 转换后端数据格式到前端格式
    const transformedData = {
        ...resp.data,
        data: {
            ...resp.data.data,
            data: resp.data.data.data.map(transformProjectFromBackend)
        }
    };
    return transformedData;
}

// 获取所有项目 (不分页，用于向后兼容)
export async function getAllProjects(): Promise<ApiResponse<Project[]>> {
    const resp = await apiClient.get("/api/v1/projects", {
        params: {
            page: 1,
            page_size: 1000 // 使用后端允许的最大页面大小
        }
    });
    const transformedData = {
        ...resp.data,
        data: resp.data.data.data.map(transformProjectFromBackend)
    };
    return transformedData;
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