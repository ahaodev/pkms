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
import {EmptyList} from '@/components/ui/empty-list';
import {toast} from 'sonner';
import {useI18n} from '@/contexts/i18n-context';

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
    const { t } = useI18n();
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
            <EmptyList
                icon={Package}
                title={t('clientAccess.noCredentials')}
                description={t('clientAccess.noCredentialsDescription')}
            />
        );
    }

    const handleCopyToken = async (token: string) => {
        try {
            await navigator.clipboard.writeText(token);
            toast.success(t('clientAccess.tokenCopied'));
        } catch {
            toast.error(t('clientAccess.tokenCopyFailed'));
        }
    };

    const getStatusColor = (isActive: boolean, expiresAt?: string) => {
        if (!isActive) return 'secondary';
        if (expiresAt && new Date(expiresAt) < new Date()) return 'destructive';
        return 'default';
    };

    const getStatusText = (isActive: boolean, expiresAt?: string) => {
        if (!isActive) return t('clientAccess.inactive');
        if (expiresAt && new Date(expiresAt) < new Date()) return t('clientAccess.expired');
        return t('clientAccess.active');
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
                            <TableHead>{t('clientAccess.project')}</TableHead>
                            <TableHead>{t('clientAccess.package')}</TableHead>
                            <TableHead>{t('clientAccess.name')}</TableHead>
                            <TableHead>{t('clientAccess.status')}</TableHead>
                            <TableHead>{t('clientAccess.lastUsed')}</TableHead>
                            <TableHead>{t('common.description')}</TableHead>
                            <TableHead className="text-right">{t('common.actions')}</TableHead>
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
                                            <span className="text-muted-foreground">{t('clientAccess.neverUsed')}</span>
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
                                                        {t('common.edit')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => onToggleStatus(clientAccess.id, !clientAccess.is_active)}
                                                    >
                                                        {clientAccess.is_active ? (
                                                            <>
                                                                <EyeOff className="mr-2 h-4 w-4"/>
                                                                {t('clientAccess.disable')}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className="mr-2 h-4 w-4"/>
                                                                {t('clientAccess.enable')}
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleRegenerateClick(clientAccess)}>
                                                        <RefreshCw className="mr-2 h-4 w-4"/>
                                                        {t('clientAccess.regenerateToken')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator/>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteClick(clientAccess)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4"/>
                                                        {t('common.delete')}
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
                        <AlertDialogTitle>{t('clientAccess.deleteConfirm')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('clientAccess.deleteConfirmDescription', { name: selectedClientAccess?.name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t('common.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* 重新生成令牌确认对话框 */}
            <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('clientAccess.regenerateConfirm')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('clientAccess.regenerateConfirmDescription')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRegenerateConfirm}>
                            {t('clientAccess.regenerate')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}