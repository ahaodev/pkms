import {Release} from "@/types/release.ts";

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
