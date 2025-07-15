import { AuthLayout, LoginCard } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * 注册页面 - 未来可能需要的功能
 */
export default function RegisterPage() {
  return (
    <AuthLayout>
      <LoginCard 
        title="注册账户" 
        description="创建您的 PKMS 账户"
      >
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              type="text"
              placeholder="输入用户名"
              autoComplete="username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="输入邮箱地址"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="输入密码"
              autoComplete="new-password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认密码</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="再次输入密码"
              autoComplete="new-password"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            注册
          </Button>
        </form>
      </LoginCard>
    </AuthLayout>
  );
}
