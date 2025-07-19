// 简化的类型定义

export type UserRole = 'admin' | 'user';

export interface Group {
    id: string;
    name: string;
    description: string;
    color?: string; // 组标识颜色
    createdAt: Date;
    updatedAt: Date;
    memberCount: number;
    createdBy: string; // 创建者用户ID
    permissions: GroupPermission[];
}

export interface GroupPermission {
    projectId: string;
    canView: boolean;
    canEdit: boolean;
}

export interface JwtUser {
    id: string;
    name: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    isActive: boolean;
    createdAt: Date;
}

export interface Profile {
    id: string;
    name:string;
    tenants: Tenant[];
}

export interface Tenant {
    id: string;
    name: string;
}

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

export interface Package {
    id: string;
    projectId: string;
    name: string;
    description: string;
    type: 'android' | 'web' | 'desktop' | 'linux' | 'other';
    createdAt: Date;
    updatedAt: Date;
}

export interface PackageFilters {
    projectId?: string;
    type?: Package['type'];
    isLatest?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
}


export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export interface ReleaseUpload {
    file: File;
    package_id: string;
    name: string;
    type: Package['type'];
    version: string;
    changelog?: string;
}

// 用户管理相关类型
export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    assignedProjectIds?: string[];
    groupIds?: string[];
}

// 组管理相关类型
export interface CreateGroupRequest {
    name: string;
    description: string;
    color?: string;
    permissions?: GroupPermission[];
}

export interface UpdateGroupRequest {
    name?: string;
    description?: string;
    color?: string;
    permissions?: GroupPermission[];
}

export interface Release {
    id: string;
    packageId: string;
    version: string;
    tagName?: string;
    title?: string;
    description?: string; // 发布说明/变更日志
    filePath: string;
    fileName: string;
    fileSize: number;
    fileHash?: string;
    isPrerelease: boolean;
    isLatest: boolean;
    isDraft: boolean;
    downloadCount: number;
    shareToken?: string;
    shareExpiry?: Date;
    createdBy: string;
    createdAt: Date;
    publishedAt?: Date;
}

export interface PackageFilters {
    projectId?: string;
    type?: Package['type'];
    isLatest?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
}


export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

// 用户管理相关类型
export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    assignedProjectIds?: string[];
    groupIds?: string[];
}

// 组管理相关类型
export interface CreateGroupRequest {
    name: string;
    description: string;
    color?: string;
    permissions?: GroupPermission[];
}

export interface UpdateGroupRequest {
    name?: string;
    description?: string;
    color?: string;
    permissions?: GroupPermission[];
}

// 扩展的包接口，包含从API返回的额外字段（用于向后兼容）
export interface ExtendedPackage extends Package {
    // 从 latestRelease 展平的字段
    version?: string;
    changelog?: string;
    downloadCount?: number;
    isLatest?: boolean;
    fileSize?: number;
    fileName?: string;
    checksum?: string;

    // 其他扩展字段
    createdBy?: string;
    latestRelease?: Release;
}
