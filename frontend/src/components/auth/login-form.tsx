import {useCallback} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useLogin, UseLoginOptions} from '@/hooks/use-login';

interface LoginFormProps extends UseLoginOptions {
    className?: string;
}

export function LoginForm({className, ...loginOptions}: LoginFormProps) {
    const {formData, updateField, login, isLoading} = useLogin(loginOptions);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        await login();
    }, [login]);

    return (
        <form onSubmit={handleSubmit} className={`space-y-4 ${className || ''}`}>
            <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => updateField('username', e.target.value)}
                    placeholder="输入用户名"
                    disabled={isLoading}
                    autoComplete="username"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="输入密码"
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '登录中...' : '登录'}
            </Button>
        </form>
    );
}

// 保持向后兼容
export interface LoginFormData {
    username: string;
    password: string;
}
