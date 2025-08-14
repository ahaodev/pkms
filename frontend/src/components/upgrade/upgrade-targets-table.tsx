import {useCallback} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {Card, CardContent} from '@/components/ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Switch} from '@/components/ui/switch';
import {CheckCircle, Edit, FolderOpen, Package as PackageIcon, Trash2, XCircle, Target} from 'lucide-react';
import {EmptyList} from '@/components/ui/empty-list';
import {toast} from 'sonner';
import {formatFileSize} from '@/lib/utils';
import {deleteUpgradeTarget, updateUpgradeTarget, UpgradeTarget} from '@/lib/api/upgrade';
import {CustomSkeleton} from '@/components/custom-skeleton';
import {useI18n} from '@/contexts/i18n-context';

interface UpgradeTargetsTableProps {
    upgradeTargets: UpgradeTarget[];
    isLoading: boolean;
    onEdit: (target: UpgradeTarget) => void;
}

export function UpgradeTargetsTable({
    upgradeTargets,
    isLoading,
    onEdit
}: UpgradeTargetsTableProps) {
    const { t } = useI18n();
    const queryClient = useQueryClient();

    // Backend now handles sorting by created_at DESC, no need for client-side sorting
    const sortedUpgradeTargets = upgradeTargets;

    // Delete upgrade target mutation
    const deleteUpgradeTargetMutation = useMutation({
        mutationFn: deleteUpgradeTarget,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['upgrade-targets']});
            toast.success(t('upgrade.deleteSuccess'));
        },
        onError: (error: any) => {
            console.error(error);
            // 提取后端返回的具体错误消息
            const errorMessage = error?.response?.data?.msg || error?.message || t('common.error');
            toast.error(`${t('common.deleteError')}: ${errorMessage}`);
        }
    });

    // Toggle active status mutation - only allow one active at a time
    const toggleActiveMutation = useMutation({
        mutationFn: ({id, is_active}: { id: string, is_active: boolean }) =>
            updateUpgradeTarget(id, { is_active }),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['upgrade-targets']});
            toast.success(t('upgrade.statusUpdateSuccess'));
        },
        onError: (error: any) => {
            console.error(error);
            // 提取后端返回的具体错误消息
            const errorMessage = error?.response?.data?.msg || error?.message || t('common.error');
            toast.error(`${t('upgrade.statusUpdateError')}: ${errorMessage}`);
        }
    });

    const handleToggleActive = useCallback((target: UpgradeTarget) => {
        // If activating this target, we need to deactivate all others first
        if (!target.is_active) {
            // Find currently active target
            const currentActiveTarget = upgradeTargets.find(t => t.is_active && t.id !== target.id);
            
            if (currentActiveTarget) {
                // Deactivate the current active target first
                toggleActiveMutation.mutate({
                    id: currentActiveTarget.id,
                    is_active: false
                }, {
                    onSuccess: () => {
                        // Then activate the new target
                        toggleActiveMutation.mutate({
                            id: target.id,
                            is_active: true
                        });
                    }
                });
            } else {
                // No currently active target, just activate this one
                toggleActiveMutation.mutate({
                    id: target.id,
                    is_active: true
                });
            }
        } else {
            // Deactivating the current target
            toggleActiveMutation.mutate({
                id: target.id,
                is_active: false
            });
        }
    }, [upgradeTargets, toggleActiveMutation]);

    const handleDelete = useCallback((id: string) => {
        if (confirm(t('upgrade.deleteConfirm'))) {
            deleteUpgradeTargetMutation.mutate(id);
        }
    }, [deleteUpgradeTargetMutation, t]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('zh-CN');
    };

    if (isLoading) {
        return <CustomSkeleton type="table" rows={5} columns={8} />;
    }

    if (sortedUpgradeTargets.length === 0) {
        return (
            <EmptyList
                icon={Target}
                title={upgradeTargets.length === 0 ? t('upgrade.noTargets') : t('upgrade.noFilteredTargets')}
                description={upgradeTargets.length === 0 
                    ? t('upgrade.createFirstTarget')
                    : t('upgrade.adjustFilters')
                }
            />
        );
    }

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('project.title')}</TableHead>
                            <TableHead>{t('package.title')}</TableHead>
                            <TableHead>{t('upgrade.targetVersion')}</TableHead>
                            <TableHead>{t('upgrade.target')}</TableHead>
                            <TableHead>{t('release.size')}</TableHead>
                            <TableHead>{t('common.createdAt')}</TableHead>
                            <TableHead>{t('common.status')}</TableHead>
                            <TableHead className="text-right">{t('common.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedUpgradeTargets.map((target) => (
                            <TableRow key={target.id}>
                                {/* 1. 项目 */}
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <FolderOpen className="h-4 w-4 text-muted-foreground"/>
                                        <span className="font-medium">
                                            {target.project_name || target.project_id}
                                        </span>
                                    </div>
                                </TableCell>
                                {/* 2. 包 */}
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <PackageIcon className="h-4 w-4 text-muted-foreground"/>
                                            <span className="font-medium">
                                                {target.package_name || target.package_id}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                {/* 3. 目标版本 */}
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium">
                                            {target.version || 'N/A'}
                                        </div>
                                        {target.file_name && (
                                            <div className="text-sm text-muted-foreground">
                                                {target.file_name}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                {/* 4. 升级目标 */}
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium">{target.name}</div>
                                        {target.description && (
                                            <div className="text-sm text-muted-foreground">
                                                {target.description}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                {/* 5. 文件大小 */}
                                <TableCell>
                                    {target.file_size ? formatFileSize(target.file_size) : 'N/A'}
                                </TableCell>
                                {/* 6. 创建时间 */}
                                <TableCell>
                                    {formatDate(target.created_at)}
                                </TableCell>
                                {/* 7. 状态 */}
                                <TableCell>
                                    <div className="flex items-center space-x-3">
                                        <Badge
                                            variant={target.is_active ? "default" : "secondary"}
                                            className="flex items-center space-x-1 w-fit"
                                        >
                                            {target.is_active ? (
                                                <CheckCircle className="h-3 w-3"/>
                                            ) : (
                                                <XCircle className="h-3 w-3"/>
                                            )}
                                            <span>{target.is_active ? t('upgrade.active') : t('upgrade.inactive')}</span>
                                        </Badge>
                                        <Switch
                                            checked={target.is_active}
                                            onCheckedChange={() => handleToggleActive(target)}
                                            disabled={toggleActiveMutation.isPending}
                                        />
                                    </div>
                                </TableCell>
                                {/* 8. 操作 */}
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(target)}
                                        >
                                            <Edit className="h-4 w-4"/>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(target.id)}
                                            disabled={target.is_active}
                                            title={target.is_active ? t('upgrade.cannotDeleteActive') : t('upgrade.deleteTarget')}
                                        >
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}