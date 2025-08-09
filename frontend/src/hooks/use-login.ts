import {useState, useCallback, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'sonner';
import {useAuth} from '@/providers/auth-provider.tsx';

export interface UseLoginOptions {
    redirectTo?: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

type Field = 'username' | 'password';

export function useLogin(options: UseLoginOptions = {}) {
    const {redirectTo = '/', onSuccess, onError} = options;
    const navigate = useNavigate();
    const {login: authLogin, isLoading} = useAuth();

    const initialFormData = useMemo(() => ({
        username: '',
        password: '',
    }), []);

    const [formData, setFormData] = useState(initialFormData);

    const updateField = useCallback((field: Field, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    }, []);

    const resetForm = useCallback(() => {
        setFormData(initialFormData);
    }, [initialFormData]);

    const validateForm = useCallback((): boolean => {
        if (!formData.username || !formData.password) {
            const errorMessage = '请输入用户名和密码。';
            toast.error(errorMessage);
            onError?.(errorMessage);
            return false;
        }
        return true;
    }, [formData, toast, onError]);

    const login = useCallback(async () => {
        if (!validateForm()) return false;

        try {
            const success = await authLogin(formData.username, formData.password);

            if (success) {
                toast.success('欢迎使用 PKMS 包管理系统');
                onSuccess?.();
                navigate(redirectTo, {replace: true});
                return true;
            } else {
                const errorMessage = '用户名或密码错误。';
                toast.error(errorMessage);
                onError?.(errorMessage);
                return false;
            }
        } catch (error: any) {
            // 处理特定的错误状态
            let errorMessage = '登录失败，请重试。';
            
            if (error?.response?.status === 423) {
                // 账户被锁定
                errorMessage = error.response.data?.message || '账户已被锁定，请稍后重试。';
                toast.error(errorMessage, {
                    duration: 5000, // 显示5秒
                });
            } else if (error?.response?.status === 401) {
                // 用户名或密码错误（包含剩余尝试次数信息）
                errorMessage = error.response.data?.message || '用户名或密码错误。';
                toast.error(errorMessage);
            } else if (error?.response?.data?.message) {
                // 其他后端返回的错误信息
                errorMessage = error.response.data.message;
                toast.error(errorMessage);
            } else {
                // 网络错误或其他错误
                toast.error(errorMessage);
            }
            
            onError?.(errorMessage);
            return false;
        }
    }, [formData, validateForm, authLogin, toast, onSuccess, onError, navigate, redirectTo]);

    return {
        formData,
        updateField,
        resetForm,
        login,
        isLoading,
        validateForm,
    };
}