import axios from "axios";
import {ACCESS_TOKEN, CURRENT_TENANT} from "@/types/constants.ts";

const getApiBaseURL = () => {
    return `${window.location.protocol}//${window.location.host}`;
};

export const apiClient = axios.create({
    baseURL: getApiBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 300000, // 300秒
});

// 动态设置 Authorization 头部
apiClient.interceptors.request.use((config: any) => {
    // 从localStorage获取token
    const token = localStorage.getItem(ACCESS_TOKEN);
    const currentTenant = localStorage.getItem(CURRENT_TENANT);
    if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
        if(currentTenant){
            console.log('API Request: Using tenant ID:', currentTenant);
            config.headers['x-tenant-id'] = currentTenant || ''; // 添加租户ID头部
        }
    } else {
        console.log('API Request: No token found, request will be unauthenticated');
    }
    return config;
}, (error: any) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
});

apiClient.interceptors.response.use(
    (response: any) => {
        console.log('API Response:', response.status, response.config?.url);
        return response;
    },
    (error: any) => {
        console.error('API Error:', error.response?.status, error.config?.url, error.message);
        if (error.response?.data) {
            console.error('API Error Response:', error.response.data);
        }

        // 处理401未授权错误
        if (error.response && error.response.status === 401) {
            const requestUrl = error.config?.url || '';
            console.log('Unauthorized error:', requestUrl);

            // 只有在非登录接口且非 profile 验证接口时才清除令牌和重定向
            if (!requestUrl.includes('/login') && !requestUrl.includes('/profile')) {
                console.log('Clearing tokens and redirecting to login due to 401 on:', requestUrl);
                localStorage.removeItem(ACCESS_TOKEN);
                localStorage.removeItem(ACCESS_TOKEN);
                // 避免无限重定向，检查当前是否已经在登录页
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            } else if (requestUrl.includes('/profile')) {
                console.log('Profile validation failed with 401, clearing only access token but keeping user logged in');
                // profile 验证失败时只清除访问 token，保留用户状态
                localStorage.removeItem(ACCESS_TOKEN);
                // 不清除 refresh token，因为可能需要用它来获取新的 access token
                // 不清除 user 数据，保持用户登录状态
            } else if (requestUrl.includes('/login')) {
                console.log('Login request failed with 401, this is expected for invalid credentials');
            }
        }

        return Promise.reject(error);
    }
);