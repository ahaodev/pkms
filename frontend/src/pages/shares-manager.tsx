import {memo, useCallback, useRef} from 'react';
import {ProjectPackageFilters} from '@/components/project-package-filters';
import {useProjects} from '@/hooks/use-projects';
import {usePackages} from '@/hooks/use-packages';
import {useShareDialogs, useShareFilters, useShares} from '@/hooks/use-shares';
import {DeleteShareDialog, SharesTable} from '@/components/shares';
import {ShareDialog} from '@/components/share-dialog';
import {ErrorBoundary} from '@/components/ui/error-boundary';
import {PageHeader} from "@/components/page-header";
import {useI18n} from '@/contexts/i18n-context';

function SharesManagerPage() {
    const {t} = useI18n();
    // 基础数据
    const {data: projects = []} = useProjects();
    const {data: packagesData} = usePackages();
    const packages = packagesData?.data || [];
    const lastFocusRef = useRef<HTMLElement | null>(null);

    // 自定义 hooks
    const {shares, isLoading, error, deleteMutation} = useShares();
    const {
        filters,
        filteredShares,
        updateProjectFilter,
        updatePackageFilter,
        totalCount,
    } = useShareFilters(shares, projects, packages);
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
            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    title={t('share.title')}
                    description={t('share.description')}
                />

                {/* Filters */}
                <ProjectPackageFilters
                    projectFilter={filters.project}
                    packageFilter={filters.package}
                    totalCount={totalCount}
                    countLabel={t('share.sharesCount')}
                    projects={projects}
                    packages={packages}
                    onProjectFilterChange={updateProjectFilter}
                    onPackageFilterChange={updatePackageFilter}
                />

                {/* Shares Table */}
                <SharesTable
                    shares={filteredShares}
                    isLoading={isLoading}
                    error={error}
                    onDeleteClick={handleDeleteClick}
                    onViewClick={handleViewClickWithFocus}
                />

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
            </div>
        </ErrorBoundary>
    );
}

export default memo(SharesManagerPage);