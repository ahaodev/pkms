import axios from "axios";

// 获取API基础URL，支持环境变量配置
const getApiBaseURL = () => {
    // 优先使用环境变量
    if (import.meta.env.VITE_API_BASE) {
        return import.meta.env.VITE_API_BASE;
    }
    
    // 开发环境使用代理路径
    if (import.meta.env.DEV) {
        return '';
    }
    
    // 生产环境使用完整URL
    return `${window.location.protocol}//${window.location.host}`;
};

export const apiClient = axios.create({
    baseURL: getApiBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10秒超时
});

// 动态设置 Authorization 头部
apiClient.interceptors.request.use((config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
   
    // 从localStorage获取token
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
});

apiClient.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('API Error:', error.response?.status, error.config?.url, error.message);
        
        // 处理401未授权错误
        if (error.response && error.response.status === 401) {
            console.log('Unauthorized - clearing token and redirecting to login');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            // 可以在这里触发重定向到登录页面
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);