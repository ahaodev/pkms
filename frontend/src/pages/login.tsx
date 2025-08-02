import {LoginForm} from '@/components/auth';

/**
 * 登录页：用户登录入口，支持表单校验与登录反馈
 */
export default function LoginPage() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <LoginForm />
            </div>
        </div>
    );
}