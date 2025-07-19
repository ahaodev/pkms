import {useState} from 'react';
import {Bell} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Switch} from '@/components/ui/switch';
import {Separator} from '@/components/ui/separator';
import {toast} from '@/hooks/use-toast';

interface NotificationSettingsProps {
    onSave?: (settings: NotificationConfig) => void;
}

export interface NotificationConfig {
    notifyOnNewRelease: boolean;
    emailNotifications: boolean;
}

export function NotificationSettings({onSave}: NotificationSettingsProps) {
    const [notifyOnNewRelease, setNotifyOnNewRelease] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);

    const handleSaveNotifications = () => {
        const config: NotificationConfig = {
            notifyOnNewRelease,
            emailNotifications
        };

        onSave?.(config);

        toast({
            title: "设置已保存",
            description: "通知偏好设置已更新",
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Bell className="mr-2 h-5 w-5"/>
                    通知偏好设置
                </CardTitle>
                <CardDescription>
                    配置何时以及如何接收通知
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>新发布通知</Label>
                            <p className="text-sm text-muted-foreground">
                                有新发布可用时获得通知
                            </p>
                        </div>
                        <Switch
                            id="notify-release"
                            checked={notifyOnNewRelease}
                            onCheckedChange={setNotifyOnNewRelease}
                        />
                    </div>

                    <Separator/>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>邮件通知</Label>
                            <p className="text-sm text-muted-foreground">
                                通过邮件发送通知
                            </p>
                        </div>
                        <Switch
                            id="email-notifications"
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSaveNotifications} className="ml-auto">保存偏好设置</Button>
            </CardFooter>
        </Card>
    );
}
