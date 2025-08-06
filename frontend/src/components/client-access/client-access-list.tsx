import {useState} from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
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
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Activity, Copy, Edit, Eye, EyeOff, FolderOpen, MoreHorizontal, Package, RefreshCw, Trash2} from 'lucide-react';
import {formatDistanceToNow} from 'date-fns';
import {zhCN} from 'date-fns/locale';
import type {ClientAccess} from '@/types/client-access';
import {CustomSkeleton} from "@/components/custom-skeleton.tsx";
import {toast} from 'sonner';

interface ClientAccessListProps {
    clientAccesses: ClientAccess[] | null | undefined;
    loading?: boolean;
    error?: string;
    onEdit: (clientAccess: ClientAccess) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string, isActive: boolean) => void;
    onRegenerateToken: (id: string) => void;
    onViewToken: (clientAccess: ClientAccess) => void;
}

export function ClientAccessList({
                                     clientAccesses,
                                     loading,
                                     error,
                                     onEdit,
                                     onDelete,
                                     onToggleStatus,
                                     onRegenerateToken,
                                     onViewToken,
                                 }: ClientAccessListProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
    const [selectedClientAccess, setSelectedClientAccess] = useState<ClientAccess | null>(null);

    if (loading) {
        return <CustomSkeleton type="table" rows={5} columns={7} />;
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <Package className="h-4 w-4"/>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    // 处理 null/undefined 或空数组的情况
    if (!clientAccesses || clientAccesses.length === 0) {
        return (
            <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground"/>
                <h3 className="mt-4 text-lg font-semibold">暂无设备接入凭证</h3>
                <p className="mt-2 text-muted-foreground">
                    创建第一个接入凭证来允许客户端设备访问升级服务
                </p>
            </div>
        );
    }

    const handleCopyToken = async (token: string) => {
        try {
            await navigator.clipboard.writeText(token);
            toast.success("访问令牌已复制到剪贴板");
        } catch {
            toast.error("复制失败，请手动复制访问令牌");
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

    const handleDeleteClick = (clientAccess: ClientAccess) => {
        setSelectedClientAccess(clientAccess);
        setShowDeleteDialog(true);
    };

    const handleRegenerateClick = (clientAccess: ClientAccess) => {
        setSelectedClientAccess(clientAccess);
        setShowRegenerateDialog(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedClientAccess) {
            onDelete(selectedClientAccess.id);
            setShowDeleteDialog(false);
            setSelectedClientAccess(null);
        }
    };

    const handleRegenerateConfirm = () => {
        if (selectedClientAccess) {
            onRegenerateToken(selectedClientAccess.id);
            setShowRegenerateDialog(false);
            setSelectedClientAccess(null);
        }
    };

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>项目</TableHead>
                            <TableHead>包</TableHead>
                            <TableHead>名称</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>最后使用</TableHead>
                            <TableHead>描述</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clientAccesses.map((clientAccess) => {
                            return (
                                <TableRow key={clientAccess.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm">
                                            <FolderOpen className="h-3 w-3 text-muted-foreground"/>
                                            <span>{clientAccess.project_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm">
                                            <Package className="h-3 w-3 text-muted-foreground"/>
                                            <span>{clientAccess.package_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {clientAccess.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={getStatusColor(clientAccess.is_active, clientAccess.expires_at)}>
                                            {getStatusText(clientAccess.is_active, clientAccess.expires_at)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {clientAccess.last_used_at ? (
                                            <div className="flex items-center gap-1 text-sm">
                                                <Activity className="h-3 w-3 text-muted-foreground"/>
                                                <span>
                                                    {formatDistanceToNow(new Date(clientAccess.last_used_at), {
                                                        addSuffix: true,
                                                        locale: zhCN
                                                    })}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">从未使用</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground line-clamp-2">
                                            {clientAccess.description || '-'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onViewToken(clientAccess)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Eye className="h-4 w-4"/>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopyToken(clientAccess.access_token)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Copy className="h-4 w-4"/>
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
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
                                                    <DropdownMenuItem
                                                        onClick={() => handleRegenerateClick(clientAccess)}>
                                                        <RefreshCw className="mr-2 h-4 w-4"/>
                                                        重新生成令牌
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator/>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteClick(clientAccess)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4"/>
                                                        删除
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* 删除确认对话框 */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                            确定要删除接入凭证 "{selectedClientAccess?.name}" 吗？此操作无法撤销，
                            客户端将无法继续使用此令牌访问服务。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
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
                        <AlertDialogAction onClick={handleRegenerateConfirm}>
                            重新生成
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}