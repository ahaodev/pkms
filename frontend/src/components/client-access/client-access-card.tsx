import {Card, CardContent, CardHeader} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Activity,
    Calendar,
    Copy,
    Edit,
    Eye,
    EyeOff,
    FolderOpen,
    MoreHorizontal,
    Package,
    RefreshCw,
    Trash2
} from 'lucide-react';
import {formatDistanceToNow} from 'date-fns';
import {zhCN} from 'date-fns/locale';
import {useState} from 'react';
import type {ClientAccess} from '@/types/client-access';
import {toast} from '@/hooks/use-toast';

interface ClientAccessCardProps {
    clientAccess: ClientAccess;
    onEdit: (clientAccess: ClientAccess) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string, isActive: boolean) => void;
    onRegenerateToken: (id: string) => void;
    onViewToken: (clientAccess: ClientAccess) => void;
}

export function ClientAccessCard({
                                     clientAccess,
                                     onEdit,
                                     onDelete,
                                     onToggleStatus,
                                     onRegenerateToken,
                                     onViewToken,
                                 }: ClientAccessCardProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);

    const handleCopyToken = async () => {
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

    const getStatusColor = (isActive: boolean, expiresAt?: string) => {
        if (!isActive) return 'secondary';
        if (expiresAt && new Date(expiresAt) < new Date()) return 'destructive';
        return 'default';
    };

    const getStatusText = (isActive: boolean, expiresAt?: string) => {
        if (!isActive) return '已禁用';
        if (expiresAt && new Date(expiresAt) < new Date()) return '已过期';
        return '正常';
    };

    const isExpired = clientAccess.expires_at && new Date(clientAccess.expires_at) < new Date();

    return (
        <>
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{clientAccess.name}</h3>
                                <Badge variant={getStatusColor(clientAccess.is_active, clientAccess.expires_at)}>
                                    {getStatusText(clientAccess.is_active, clientAccess.expires_at)}
                                </Badge>
                            </div>
                            {clientAccess.description && (
                                <p className="text-sm text-muted-foreground">
                                    {clientAccess.description}
                                </p>
                            )}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onViewToken(clientAccess)}>
                                    <Eye className="mr-2 h-4 w-4"/>
                                    查看令牌
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleCopyToken}>
                                    <Copy className="mr-2 h-4 w-4"/>
                                    复制令牌
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem onClick={() => onEdit(clientAccess)}>
                                    <Edit className="mr-2 h-4 w-4"/>
                                    编辑
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onToggleStatus(clientAccess.id, !clientAccess.is_active)}
                                >
                                    {clientAccess.is_active ? (
                                        <>
                                            <EyeOff className="mr-2 h-4 w-4"/>
                                            禁用
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="mr-2 h-4 w-4"/>
                                            启用
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowRegenerateDialog(true)}>
                                    <RefreshCw className="mr-2 h-4 w-4"/>
                                    重新生成令牌
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4"/>
                                    删除
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    {/* 项目和包信息 */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                            <FolderOpen className="h-4 w-4 text-muted-foreground"/>
                            <span className="text-muted-foreground">项目:</span>
                            <span className="font-medium">{clientAccess.project_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Package className="h-4 w-4 text-muted-foreground"/>
                            <span className="text-muted-foreground">包:</span>
                            <span className="font-medium">{clientAccess.package_name}</span>
                        </div>
                    </div>

                    {/* 时间信息 */}
                    <div className="space-y-2">
                        {clientAccess.expires_at && (
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground"/>
                                <span className="text-muted-foreground">过期时间:</span>
                                <span className={`font-medium ${isExpired ? 'text-destructive' : ''}`}>
                  {formatDistanceToNow(new Date(clientAccess.expires_at), {
                      addSuffix: true,
                      locale: zhCN
                  })}
                </span>
                            </div>
                        )}
                        {clientAccess.last_used_at && (
                            <div className="flex items-center gap-2 text-sm">
                                <Activity className="h-4 w-4 text-muted-foreground"/>
                                <span className="text-muted-foreground">最后使用:</span>
                                <span className="font-medium">
                  {formatDistanceToNow(new Date(clientAccess.last_used_at), {
                      addSuffix: true,
                      locale: zhCN
                  })}
                </span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 删除确认对话框 */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                            确定要删除接入凭证 "{clientAccess.name}" 吗？此操作无法撤销，
                            客户端将无法继续使用此令牌访问服务。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => onDelete(clientAccess.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            删除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* 重新生成令牌确认对话框 */}
            <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认重新生成令牌</AlertDialogTitle>
                        <AlertDialogDescription>
                            确定要重新生成访问令牌吗？旧的令牌将立即失效，
                            需要及时更新客户端配置。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onRegenerateToken(clientAccess.id)}>
                            重新生成
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}