import {Package} from "@/types/package.ts";

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
export interface ReleaseUpload {
    file: File;
    package_id: string;
    name: string;
    type: Package['type'];
    version: string;
    changelog?: string;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}
export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}