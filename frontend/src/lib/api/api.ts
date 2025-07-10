import axios from "axios";


const getApiBaseURL = () => {
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
apiClient.interceptors.request.use((config: any) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
   
    // 从localStorage获取token
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
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