// Package import removed as it's unused after consolidation

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

// PackageFilters 已移至 package.ts 以避免重复定义
