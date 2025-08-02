import {LoginCard, LoginForm} from '@/components/auth';

/**
 * 登录页：用户登录入口，支持表单校验与登录反馈
 */
export default function LoginPage() {
    return (
        <div
            className={`w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4`}>
            <LoginCard>
                <LoginForm/>
            </LoginCard>
        </div>
    );
}