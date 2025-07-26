
export interface Release {
    id: string;
    package_id: string;
    version_code: string;
    version_name?: string;
    tag_name?: string;
    changelog?: string; // 发布说明/变更日志
    file_path: string;
    file_name: string;
    file_size: number;
    file_hash?: string;
    download_count: number;
    share_token?: string;
    share_expiry?: Date;
    created_by: string;
    created_at: Date;
}
export interface ReleaseUpload {
    file: File;
    package_id: string;
    version_code: string;
    version_name: string;
    tag_name?: string;
    changelog?: string;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}