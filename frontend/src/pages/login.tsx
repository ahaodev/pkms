import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/simple-auth-context';
import { Package } from 'lucide-react';

/**
 * 登录页：用户登录入口，支持表单校验与登录反馈
 */

interface LoginFormData {
  username: string;
  password: string;
}

const initialFormData: LoginFormData = {
  username: '',
  password: '',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>(initialFormData);

  const updateFormData = useCallback((field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!formData.username || !formData.password) {
      toast({
        variant: 'destructive',
        title: '登录失败',
        description: '请输入用户名和密码。',
      });
      return false;
    }
    return true;
  }, [formData, toast]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const success = await login(formData.username, formData.password);
    
    if (success) {
      toast({
        title: '登录成功',
        description: '欢迎使用 PKMS 包管理系统。',
      });
      navigate('/', { replace: true });
    } else {
      toast({
        variant: 'destructive',
        title: '登录失败',
        description: '用户名或密码错误。',
      });
    }
  }, [formData, validateForm, login, toast, navigate]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Package className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">PKMS</CardTitle>
          <CardDescription>
            包管理系统 - 轻松管理您的软件包
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => updateFormData('username', e.target.value)}
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
                onChange={(e) => updateFormData('password', e.target.value)}
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
        </CardContent>
      </Card>
    </div>
  );
}