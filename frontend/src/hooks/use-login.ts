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