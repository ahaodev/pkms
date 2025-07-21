import {Package} from "@/types/package.ts";

export interface Project {
    id: string;
    name: string;
    description: string;
    icon?: string;
    createdAt: Date;
    updatedAt: Date;
    packageCount: number;
    createdBy: string; // 创建者用户ID
}

export interface PackageFilters {
    projectId?: string;
    type?: Package['type'];
    isLatest?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
}
