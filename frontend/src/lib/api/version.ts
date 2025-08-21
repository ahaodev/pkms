// 创建用户
import {ApiResponse} from "@/types/api-response.ts";
import {apiClient} from "@/lib/api/api.ts";

export async function getVersion(): Promise<ApiResponse<string>> {
    const resp = await apiClient.get("/api/v1/version");
    return resp.data;
}