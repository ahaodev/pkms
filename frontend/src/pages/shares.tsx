import {memo, useCallback, useRef, useState} from 'react';
import {useShareDialogs, useSharesWithPagination} from '@/hooks/use-shares';
import {DeleteShareDialog, SharesTable} from '@/components/shares';
import {ShareDialog} from '@/components/share-dialog';
import {ErrorBoundary} from '@/components/ui/error-boundary';
import {Page, PageHeader, PageContent} from "@/components/page";
import {useI18n} from '@/contexts/i18n-context';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

function SharesManagerPage() {
    const {t} = useI18n();
    const lastFocusRef = useRef<HTMLElement | null>(null);

    // 分页状态
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);

    // 自定义 hooks
    const {paginatedData, isLoading, error, deleteMutation} = useSharesWithPagination(currentPage, pageSize);
    
    // 从分页数据中提取信息
    const shares = paginatedData?.list || [];
    const totalCount = paginatedData?.total || 0;
    const totalPages = paginatedData?.total_pages || 1;
    
    const {
        dialogState,
        handleDeleteClick,
        handleViewClick,
        closeDeleteDialog,
        closeViewDialog,
    } = useShareDialogs();

    const handleDeleteConfirm = useCallback(() => {
        if (dialogState.shareToDelete) {
            deleteMutation.mutate(dialogState.shareToDelete.id, {
                onSuccess: closeDeleteDialog,
            });
        }
    }, [deleteMutation, dialogState.shareToDelete, closeDeleteDialog]);


    const handleCloseViewDialog = useCallback(() => {
        closeViewDialog();
        // Restore focus after a brief delay to allow DOM to update
        setTimeout(() => {
            if (lastFocusRef.current && document.body.contains(lastFocusRef.current)) {
                lastFocusRef.current.focus();
            } else {
                // Fallback: focus on the first button in the page
                const firstButton = document.querySelector('button');
                if (firstButton) {
                    firstButton.focus();
                }
            }
            lastFocusRef.current = null;
        }, 100);
    }, [closeViewDialog]);

    const handleViewClickWithFocus = useCallback((share: any) => {
        lastFocusRef.current = document.activeElement as HTMLElement;
        handleViewClick(share);
    }, [handleViewClick]);


    return (
        <ErrorBoundary>
            <Page isLoading={isLoading}>
                <PageHeader
                    title={t('share.title')}
                    description={t('share.description')}
                />

                <PageContent>
                    {/* 统计信息 */}
                    <div className="mb-6">
                        <div className="text-sm text-muted-foreground">
                            总数: {totalCount}
                        </div>
                    </div>

                    {/* Shares Table */}
                    <SharesTable
                        shares={shares}
                        isLoading={isLoading}
                        error={error}
                        onDeleteClick={handleDeleteClick}
                        onViewClick={handleViewClickWithFocus}
                    />
                    
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

                    {/* Delete Confirmation Dialog */}
                    <DeleteShareDialog
                        isOpen={dialogState.deleteOpen}
                        shareToDelete={dialogState.shareToDelete}
                        isDeleting={deleteMutation.isPending}
                        onClose={closeDeleteDialog}
                        onConfirm={handleDeleteConfirm}
                    />

                    {/* View Share Dialog */}
                    {dialogState.shareToView && (
                        <ShareDialog
                            isOpen={dialogState.viewOpen}
                            onClose={handleCloseViewDialog}
                            shareUrl={dialogState.shareToView.share_url}
                            packageName={`${dialogState.shareToView.package_name} (${dialogState.shareToView.version})`}
                        />
                    )}
                </PageContent>
            </Page>
        </ErrorBoundary>
    );
}

export default memo(SharesManagerPage);