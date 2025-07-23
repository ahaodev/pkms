import { useState } from 'react';
import { Shield, Clock, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

export interface SecurityConfig {
  sessionTimeout: string;
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  ipWhitelist: boolean;
  passwordExpiration: string;
}

interface SecuritySettingsProps {
  onSave?: (config: SecurityConfig) => void;
}

export function SecuritySettings({ onSave }: SecuritySettingsProps) {
  const [sessionTimeout, setSessionTimeout] = useState('24');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [passwordExpiration, setPasswordExpiration] = useState('90');

  const handleSaveSecurity = () => {
    const config: SecurityConfig = {
      sessionTimeout,
      twoFactorEnabled,
      loginNotifications,
      ipWhitelist,
      passwordExpiration
    };

    onSave?.(config);

    toast({
      title: "设置已保存",
      description: "安全设置已成功更新",
    });
  };

  const handleClearAllSessions = () => {
    toast({
      title: "会话已清理",
      description: "所有活动会话已被强制登出",
    });
  };

  return (
    <div className="space-y-6">
      {/* 会话管理 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            会话管理
          </CardTitle>
          <CardDescription>
            管理您的登录会话和超时设置
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="sessionTimeout">会话超时时间</Label>
            <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
              <SelectTrigger>
                <SelectValue placeholder="选择超时时间" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1小时</SelectItem>
                <SelectItem value="8">8小时</SelectItem>
                <SelectItem value="24">24小时</SelectItem>
                <SelectItem value="168">7天</SelectItem>
                <SelectItem value="720">30天</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              设置多长时间未活动后自动登出
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={handleClearAllSessions}>
            清理所有会话
          </Button>
        </CardFooter>
      </Card>

      {/* 安全选项 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            安全选项
          </CardTitle>
          <CardDescription>
            配置额外的安全保护措施
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>双因素认证</Label>
              <p className="text-sm text-muted-foreground">
                启用双因素认证以增强账户安全性
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>登录通知</Label>
              <p className="text-sm text-muted-foreground">
                有新设备登录时发送通知
              </p>
            </div>
            <Switch
              checked={loginNotifications}
              onCheckedChange={setLoginNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>IP白名单</Label>
              <p className="text-sm text-muted-foreground">
                只允许特定IP地址访问
              </p>
            </div>
            <Switch
              checked={ipWhitelist}
              onCheckedChange={setIpWhitelist}
            />
          </div>
        </CardContent>
      </Card>

      {/* 密码策略 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="mr-2 h-5 w-5" />
            密码策略
          </CardTitle>
          <CardDescription>
            设置密码安全策略
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="passwordExpiration">密码过期时间</Label>
            <Select value={passwordExpiration} onValueChange={setPasswordExpiration}>
              <SelectTrigger>
                <SelectValue placeholder="选择过期时间" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30天</SelectItem>
                <SelectItem value="90">90天</SelectItem>
                <SelectItem value="180">180天</SelectItem>
                <SelectItem value="365">365天</SelectItem>
                <SelectItem value="never">永不过期</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              设置密码多长时间后需要更新
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSecurity} className="ml-auto">
            保存安全设置
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}