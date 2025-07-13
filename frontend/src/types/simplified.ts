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

export interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    role: UserRole;
    createdAt: Date;
    isActive: boolean;
    assignedProjectIds?: string[]; // 普通用户被分配的项目ID列表
    groupIds?: string[]; // 用户所属的组ID列表
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

export interface Release {
    id: string;
    packageId: string; // 所属包的ID
    version: string; // 版本号，如 1.0.0
    title?: string; // 版本标题
    description?: string; // 版本描述
    changelog?: string; // 更新日志

    // 文件信息
    fileUrl: string;
    fileName: string;
    fileSize: number;
    checksum: string; // 文件校验和

    // 版本信息
    versionCode: number; // 用于版本比较的数字
    isPrerelease: boolean; // 是否为预发布版本
    isDraft: boolean; // 是否为草稿
    isLatest: boolean; // 是否为最新版本

    // 平台特定信息
    minSdkVersion?: number; // 最小SDK版本 (移动端)
    targetSdkVersion?: number; // 目标SDK版本 (移动端)

    // 统计信息
    downloadCount: number;
    createdAt: Date;
    updatedAt: Date;

    // 分享信息
    shareToken?: string; // 分享令牌
    shareExpiry?: Date; // 分享过期时间

    // 发布者信息
    createdBy: string; // 发布者用户ID
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

export interface PackageUpload {
    file: File;
    projectId: string;
    name: string;
    description: string;
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

export interface PackageUpload {
    file: File;
    projectId: string;
    name: string;
    description: string;
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

export interface GroupMembership {
    userId: string;
    groupId: string;
    joinedAt: Date;
    addedBy: string;
}

export interface UserProjectAssignment {
    userId: string;
    projectId: string;
    assignedAt: Date;
    assignedBy: string;
}

export interface ProjectPermission {
    userId: string;
    projectId: string;
    canView: boolean;
    canEdit: boolean;
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
