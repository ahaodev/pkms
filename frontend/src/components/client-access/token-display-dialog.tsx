import {useState} from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {AlertTriangle, Copy, Eye, EyeOff, Shield} from 'lucide-react';
import {toast} from '@/hooks/use-toast';
import type {ClientAccess} from '@/types/client-access';

interface TokenDisplayDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientAccess: ClientAccess | null;
}

export function TokenDisplayDialog({
                                       open,
                                       onOpenChange,
                                       clientAccess,
                                   }: TokenDisplayDialogProps) {
    const [showToken, setShowToken] = useState(false);

    const handleCopyToken = async () => {
        if (!clientAccess) return;

        try {
            await navigator.clipboard.writeText(clientAccess.access_token);
            toast({
                title: "复制成功",
                description: "访问令牌已复制到剪贴板",
            });
        } catch {
            toast({
                title: "复制失败",
                description: "请手动复制访问令牌",
                variant: "destructive",
            });
        }
    };

    const handleCopyExample = async () => {
        if (!clientAccess) return;

        const example = `{
  "access_token": "${clientAccess.access_token}",
  "current_version": "1.0.0",
  "client_info": "MyApp/1.0.0"
}`;

        try {
            await navigator.clipboard.writeText(example);
            toast({
                title: "复制成功",
                description: "示例代码已复制到剪贴板",
            });
        } catch {
            toast({
                title: "复制失败",
                description: "请手动复制示例代码",
                variant: "destructive",
            });
        }
    };

    const maskedToken = (token: string) => {
        if (token.length <= 8) return token;
        return `${token.slice(0, 4)}${'*'.repeat(token.length - 8)}${token.slice(-4)}`;
    };

    if (!clientAccess) return null;

    const isExpired = clientAccess.expires_at && new Date(clientAccess.expires_at) < new Date();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5"/>
                        访问令牌详情
                    </DialogTitle>
                    <DialogDescription>
                        查看和管理客户端接入凭证的访问令牌
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* 基本信息 */}
                    <div className="space-y-4">
                        <div>
                            <Label>凭证名称</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="font-medium">{clientAccess.name}</span>
                                <Badge variant={
                                    !clientAccess.is_active
                                        ? 'secondary'
                                        : isExpired
                                            ? 'destructive'
                                            : 'default'
                                }>
                                    {!clientAccess.is_active
                                        ? '已禁用'
                                        : isExpired
                                            ? '已过期'
                                            : '正常'
                                    }
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>关联项目</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {clientAccess.project_name}
                                </p>
                            </div>
                            <div>
                                <Label>关联包</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {clientAccess.package_name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 安全警告 */}
                    {(!clientAccess.is_active || isExpired) && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4"/>
                            <AlertDescription>
                                {!clientAccess.is_active
                                    ? '此令牌已被禁用，客户端无法使用'
                                    : '此令牌已过期，客户端无法使用'
                                }
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* 访问令牌 */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>访问令牌</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowToken(!showToken)}
                            >
                                {showToken ? (
                                    <>
                                        <EyeOff className="mr-2 h-4 w-4"/>
                                        隐藏
                                    </>
                                ) : (
                                    <>
                                        <Eye className="mr-2 h-4 w-4"/>
                                        显示
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                value={showToken ? clientAccess.access_token : maskedToken(clientAccess.access_token)}
                                readOnly
                                className="font-mono text-sm"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyToken}
                            >
                                <Copy className="h-4 w-4"/>
                            </Button>
                        </div>

                        <Alert>
                            <Shield className="h-4 w-4"/>
                            <AlertDescription>
                                请妥善保管此令牌，不要在不安全的环境中暴露。如有泄露风险，请立即重新生成。
                            </AlertDescription>
                        </Alert>
                    </div>

                    {/* API 调用示例 */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>API 调用示例</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopyExample}
                            >
                                <Copy className="mr-2 h-4 w-4"/>
                                复制示例
                            </Button>
                        </div>

                        <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm font-medium mb-2">POST /api/v1/upgrade/check</p>
                            <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
{`{
  "access_token": "${showToken ? clientAccess.access_token : maskedToken(clientAccess.access_token)}",
  "current_version": "1.0.0",
  "client_info": "MyApp/1.0.0"
}`}
              </pre>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}