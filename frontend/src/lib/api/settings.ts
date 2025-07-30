import { apiClient } from "@/lib/api/api";
import { ApiResponse } from "@/types/api-response";

export interface StorageConfig {
    storage_type: 'disk' | 'minio';
    storage_base_path?: string;
    s3_address?: string;
    s3_access_key?: string;
    s3_secret_key?: string;
    s3_bucket?: string;
    s3_token?: string;
}

// 获取存储配置
export async function getStorageConfig(): Promise<ApiResponse<StorageConfig>> {
    const resp = await apiClient.get("/api/v1/settings/storage");
    return resp.data;
}

// 更新存储配置
export async function updateStorageConfig(config: StorageConfig): Promise<ApiResponse<string>> {
    const resp = await apiClient.put("/api/v1/settings/storage", config);
    return resp.data;
}

// 测试存储配置
export async function testStorageConfig(): Promise<ApiResponse<string>> {
    const resp = await apiClient.post("/api/v1/settings/storage/test");
    return resp.data;
}