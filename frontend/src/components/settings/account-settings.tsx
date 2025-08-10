import {useState} from 'react';
import {User} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {toast} from 'sonner';

export interface AccountConfig {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface AccountSettingsProps {
    onSave?: (config: AccountConfig) => void;
}

export function AccountSettings({onSave}: AccountSettingsProps) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSaveAccount = () => {
        if (newPassword && newPassword !== confirmPassword) {
            toast.error("密码错误", {
                description: "新密码和确认密码不匹配",
            });
            return;
        }

        const config: AccountConfig = {
            currentPassword,
            newPassword,
            confirmPassword
        };

        onSave?.(config);

        toast.success("设置已保存", {
            description: "账户设置已成功更新",
        });

        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="space-y-6">
            {/* 密码设置 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <User className="mr-2 h-5 w-5"/>
                        账户管理
                    </CardTitle>
                    <CardDescription>
                        更改您的登录密码
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">当前密码</Label>
                        <Input
                            id="currentPassword"
                            type="password"
                            placeholder="请输入当前密码"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>

                    <Separator/>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">新密码</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="请输入新密码"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">确认新密码</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="请再次输入新密码"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveAccount} className="ml-auto">
                        保存更改
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}