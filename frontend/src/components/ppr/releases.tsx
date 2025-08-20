import {useState, useEffect} from 'react';
import {Badge} from '@/components/ui/badge.tsx';
import {Button} from '@/components/ui/button.tsx';
import {Card} from '@/components/ui/card.tsx';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table.tsx';
import {Download, Package as PackageIcon, Plus, Share2, Trash2} from 'lucide-react';
import {EmptyList} from '@/components/empty-list.tsx';
import {formatDate, formatFileSize} from '@/lib/utils.tsx';
import {Release} from '@/types/release.ts';
import {ShareDialog} from '@/components/share-dialog.tsx';
import {createShareLink, deleteRelease} from '@/lib/api/releases.ts';
import {toast} from 'sonner';
import {useI18n} from '@/contexts/i18n-context.tsx';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

interface ReleasesViewProps {
    selectedPackage: any;
    releases: Release[];
    searchTerm: string;
    handleCreateRelease: () => void;
    handleDownload: (release: Release) => void;
    onReleaseDeleted?: (releaseId: string) => void;
    onBackToPackages?: () => void; // 新增：鼠标后退回调
    // 服务器端分页相关
    currentPage: number;
    setCurrentPage: (page: number) => void;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export function Releases({
                             selectedPackage,
                             releases,
                             searchTerm,
                             handleCreateRelease,
                             handleDownload,
                             onReleaseDeleted,
                             onBackToPackages,
                             currentPage,
                             setCurrentPage,
                             pageSize,
                             totalCount,
                             totalPages
                         }: ReleasesViewProps) {
    const {t} = useI18n();
    const [shareDialog, setShareDialog] = useState<{
        isOpen: boolean;
        shareUrl: string;
        packageName: string;
        shareId?: string;
        currentExpiryHours?: number;
    }>({isOpen: false, shareUrl: '', packageName: ''});


    const handleShare = async (release: Release) => {
        try {
            const result = await createShareLink(release.id, {expiryHours: -1}); // 默认永久
            const shareResponse = result.data;
            const fullUrl = `${window.location.origin}/share/${shareResponse.code}`;
            setShareDialog({
                isOpen: true,
                shareUrl: fullUrl,
                packageName: `${selectedPackage?.name} v${release.version_code}`,
                shareId: shareResponse.id,
                currentExpiryHours: shareResponse.expiry_hours
            });
            toast.success(t('release.shareCreated'), {
                description: t('release.shareCreatedDescription'),
            });
        } catch (error) {
            console.error(error)
            toast.error(t('release.shareCreateError'), {
                description: t('release.shareCreateErrorDescription'),
            });
        }
    };

    const handleDelete = async (release: Release) => {
        if (!confirm(t('release.deleteConfirm', {version: release.version_code}))) {
            return;
        }

        try {
            await deleteRelease(release.id);
            toast.success(t('release.deleteSuccess'), {
                description: t('release.deleteSuccessDescription', {version: release.version_code}),
            });
            // Reset to first page after deletion if current page becomes empty
            const newTotal = totalCount - 1;
            const newTotalPages = Math.ceil(newTotal / pageSize);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            }
            onReleaseDeleted?.(release.id);
        } catch (error) {
            console.error(error);
            toast.error(t('release.deleteError'), {
                description: t('release.deleteErrorDescription'),
            });
        }
    };

    const closeShareDialog = () => {
        setShareDialog({isOpen: false, shareUrl: '', packageName: ''});
    };

    // 监听鼠标后退按钮和浏览器后退，回退到 packages 页面
    useEffect(() => {
        // 使用全局window对象存储防抖标志，避免组件切换时标志丢失
        const getGlobalFlag = () => (window as any).__hierarchyBackProcessing || false;
        const setGlobalFlag = (value: boolean) => {
            (window as any).__hierarchyBackProcessing = value;
        };

        const executeBackToPackages = () => {
            if (getGlobalFlag()) {
                console.log('🚫 Releases: Back action ignored - globally processing');
                return;
            }
            
            setGlobalFlag(true);
            console.log('🎯 Releases: Executing back to packages (global flag set)');
            
            if (onBackToPackages) {
                onBackToPackages();
            }
            
            // 300ms防抖
            setTimeout(() => {
                setGlobalFlag(false);
                console.log('✅ Releases: Global processing flag reset');
            }, 300);
        };

        const handleMouseBack = (event: MouseEvent) => {
            // 检查是否是鼠标后退按钮 (button 3)
            if (event.button === 3) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                console.log('🖱️ Releases: Mouse back button pressed');
                executeBackToPackages();
                return false;
            }
        };

        const handlePopState = (event: PopStateEvent) => {
            console.log('⌨️ Releases: Browser back button pressed (popstate)');
            event.preventDefault();
            event.stopPropagation();
            
            // 阻止浏览器默认导航
            window.history.pushState(null, '', window.location.href);
            
            executeBackToPackages();
            return false;
        };

        // 添加事件监听器
        document.addEventListener('mousedown', handleMouseBack, { capture: true });
        window.addEventListener('popstate', handlePopState);
        
        // 推送历史状态以便拦截浏览器后退
        window.history.pushState(null, '', window.location.href);

        // 清理事件监听器
        return () => {
            document.removeEventListener('mousedown', handleMouseBack, { capture: true });
            window.removeEventListener('popstate', handlePopState);
        };
    }, [onBackToPackages]);
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    {selectedPackage?.name}
                </h2>
                <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{totalCount} {t('release.count')}</Badge>
                    <Button onClick={handleCreateRelease}>
                        <Plus className="mr-2 h-4 w-4"/>
                        {t('release.newRelease')}
                    </Button>
                </div>

            </div>
            {releases.length > 0 ? (
                <>
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('release.version')}</TableHead>
                                    <TableHead>{t('release.fileName')}</TableHead>
                                    <TableHead>{t('release.size')}</TableHead>
                                    <TableHead>{t('release.downloadCount')}</TableHead>
                                    <TableHead>{t('release.publishTime')}</TableHead>
                                    <TableHead>{t('release.changelog')}</TableHead>
                                    <TableHead className="text-right">{t('release.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {releases.map((release) => (
                                    <TableRow key={release.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{release.version_name}</span>
                                                <span
                                                    className="text-sm text-muted-foreground">{release.version_code}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{release.file_name}</TableCell>
                                        <TableCell>{formatFileSize(release.file_size)}</TableCell>
                                        <TableCell>{release.download_count.toLocaleString()}</TableCell>
                                        <TableCell>{formatDate(release.created_at.toISOString())}</TableCell>
                                        <TableCell className="max-w-xs">
                                            <div className="truncate text-sm text-muted-foreground"
                                                 title={release.changelog}>
                                                {release.changelog || t('release.noChangelog')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end space-x-1">
                                                <Button variant="ghost" size="sm"
                                                        onClick={() => handleShare(release)}
                                                        className="h-8 w-8 p-0">
                                                    <Share2 className="h-4 w-4"/>
                                                </Button>
                                                <Button variant="ghost" size="sm"
                                                        onClick={() => handleDownload(release)}
                                                        className="h-8 w-8 p-0">
                                                    <Download className="h-4 w-4"/>
                                                </Button>
                                                <Button variant="ghost" size="sm"
                                                        onClick={() => handleDelete(release)}
                                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>

                    {/* 分页组件 - 仅在总页数超过1页时显示 */}
                    {totalPages > 1 && (
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage > 1) {
                                                setCurrentPage(currentPage - 1);
                                            }
                                        }}
                                        className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>

                                <PaginationItem>
                                    <span className="text-sm text-muted-foreground px-4">
                                        第 {currentPage} 页，共 {totalPages} 页 (总数: {totalCount})
                                    </span>
                                </PaginationItem>

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage < totalPages) {
                                                setCurrentPage(currentPage + 1);
                                            }
                                        }}
                                        className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            ) : (
                <EmptyList
                    icon={PackageIcon}
                    title={searchTerm ? t('release.noReleasesFound') : t('release.noReleases')}
                    actionText={!searchTerm ? (
                        <div className="flex items-center">
                            <Plus className="mr-2 h-4 w-4"/>
                            {t('release.createFirstRelease')}
                        </div>
                    ) : undefined}
                    onAction={!searchTerm ? handleCreateRelease : undefined}
                    showAction={!searchTerm}
                />
            )}

            <ShareDialog
                isOpen={shareDialog.isOpen}
                onClose={closeShareDialog}
                shareUrl={shareDialog.shareUrl}
                packageName={shareDialog.packageName}
                shareId={shareDialog.shareId}
                currentExpiryHours={shareDialog.currentExpiryHours}
            />
        </div>
    );
}

