import {memo, useCallback} from 'react';
import {ProjectPackageFilters} from '@/components/project-package-filters';
import {useProjects} from '@/hooks/use-projects';
import {usePackages} from '@/hooks/use-packages';
import {useShareDialogs, useShareFilters, useShares} from '@/hooks/use-shares';
import {DeleteShareDialog, SharesTable} from '@/components/shares';
import {ShareDialog} from '@/components/share-dialog';
import {ErrorBoundary} from '@/components/ui/error-boundary';
import {PageHeader} from "@/components/ui";

function SharesManagerPage() {
    // 基础数据
    const {data: projects = []} = useProjects();
    const {data: packagesData} = usePackages();
    const packages = packagesData?.data || [];

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


    return (
        <ErrorBoundary>
            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    title="分享管理"
                    description="管理所有的文件分享链接，可以查看分享状态和删除不需要的分享"
                />

                {/* Filters */}
                <ProjectPackageFilters
                    projectFilter={filters.project}
                    packageFilter={filters.package}
                    totalCount={totalCount}
                    countLabel="个分享"
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
                    onViewClick={handleViewClick}
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
                        onClose={closeViewDialog}
                        shareUrl={dialogState.shareToView.share_url}
                        packageName={`${dialogState.shareToView.package_name} (${dialogState.shareToView.version})`}
                    />
                )}
            </div>
        </ErrorBoundary>
    );
}

export default memo(SharesManagerPage);