import {apiClient} from "@/lib/api/api";
import {ApiResponse} from "@/types/api-response";
import {Profile, User} from '@/types/user';

// 登录请求类型
export interface LoginRequest {
    username: string;
    password: string;
}

// 登录响应类型
export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

// 注册请求类型
export interface SignupRequest {
    username: string;
    email: string;
    password: string;
}

// 刷新令牌响应类型
export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}

// 用户登录
export async function login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const resp = await apiClient.post("/api/v1/login", credentials);
    return resp.data;
}

// 用户注册
export async function signup(userData: SignupRequest): Promise<ApiResponse<User>> {
    const resp = await apiClient.post("/api/v1/signup", userData);
    return resp.data;
}

// 刷新访问令牌
export async function refreshToken(refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> {
    const resp = await apiClient.post("/api/v1/refresh", {
        refresh_token: refreshToken
    });
    return resp.data;
}

// 登出（如果后端有相应接口）
export async function logout(): Promise<ApiResponse<void>> {
    const resp = await apiClient.post("/api/v1/logout");
    return resp.data;
}

// 验证当前令牌是否有效
export async function validateToken(): Promise<ApiResponse<Profile>> {
    const resp = await apiClient.get("/api/v1/profile");
    return resp.data;
}