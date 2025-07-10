import {apiClient} from "@/lib/api/api";
import {ApiResponse} from "@/types/api-response";

// 文件信息类型
export interface FileInfo {
    key: string;
    name: string;
    lastModified: Date;
    size: number;
    type: string;
    path: string;
    isFolder: boolean;
    etag?: string;
    contentType?: string;
}

// 文件上传进度类型
export interface FileUploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

// 文件列表参数
export interface FileListParams {
    bucket?: string;
    prefix?: string;
    recursive?: boolean;
}

// 获取文件列表
export async function getFileList(params?: FileListParams): Promise<ApiResponse<FileInfo[]>> {
    const searchParams = new URLSearchParams();
    if (params?.bucket) searchParams.append('bucket', params.bucket);
    if (params?.prefix) searchParams.append('prefix', params.prefix);
    if (params?.recursive !== undefined) searchParams.append('recursive', params.recursive.toString());

    const resp = await apiClient.get(`/api/v1/file?${searchParams.toString()}`);
    return resp.data;
}

// 上传文件
export async function uploadFile(
    file: File,
    options?: {
        bucket?: string;
        prefix?: string;
        onProgress?: (progress: FileUploadProgress) => void;
    }
): Promise<ApiResponse<{ file_url: string; file_name: string; file_size: number }>> {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.bucket) formData.append('bucket', options.bucket);
    if (options?.prefix) formData.append('prefix', options.prefix);

    const resp = await apiClient.post("/api/v1/file/upload", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: options?.onProgress ? (progressEvent: any) => {
            const progress: FileUploadProgress = {
                loaded: progressEvent.loaded || 0,
                total: progressEvent.total || 0,
                percentage: progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0
            };
            options.onProgress!(progress);
        } : undefined
    });
    return resp.data;
}

// 下载文件
export async function downloadFile(fileName: string): Promise<ApiResponse<Blob>> {
    const resp = await apiClient.get(`/api/v1/file/download/${fileName}`, {
        responseType: 'blob'
    });
    return resp.data;
}

// 带进度的流式下载
export async function downloadFileWithProgress(
    fileName: string,
    onProgress?: (progress: FileUploadProgress) => void
): Promise<ApiResponse<Blob>> {
    const resp = await apiClient.get("/api/v1/file/stream", {
        params: { file: fileName },
        responseType: 'blob',
        onDownloadProgress: onProgress ? (progressEvent: any) => {
            const progress: FileUploadProgress = {
                loaded: progressEvent.loaded || 0,
                total: progressEvent.total || 0,
                percentage: progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0
            };
            onProgress(progress);
        } : undefined
    });
    return resp.data;
}

// 删除文件
export async function deleteFile(bucket: string, objectName: string): Promise<ApiResponse<void>> {
    const resp = await apiClient.delete("/api/v1/file", {
        data: {
            bucket: bucket,
            object_name: objectName
        }
    });
    return resp.data;
}

// 获取文件信息
export async function getFileInfo(fileName: string): Promise<ApiResponse<FileInfo>> {
    const resp = await apiClient.get(`/api/v1/file/info/${fileName}`);
    return resp.data;
}

// 数据转换函数：后端数据转前端格式
export function transformFileInfoFromBackend(backendFile: any): FileInfo {
    return {
        key: backendFile.key,
        name: backendFile.name,
        lastModified: new Date(backendFile.last_modified),
        size: backendFile.size,
        type: backendFile.type,
        path: backendFile.path,
        isFolder: backendFile.is_folder,
        etag: backendFile.etag,
        contentType: backendFile.content_type
    };
}
