import { AuthLayout, LoginCard, LoginForm } from '@/components/auth';

/**
 * 登录页：用户登录入口，支持表单校验与登录反馈
 */
export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginCard>
        <LoginForm />
      </LoginCard>
    </AuthLayout>
  );
}