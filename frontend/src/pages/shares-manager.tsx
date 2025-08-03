import {useEffect, useMemo, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
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
import {ProjectPackageFilters} from '@/components/shared';
import {useToast} from '@/hooks/use-toast';
import {useProjects} from '@/hooks/use-projects';
import {usePackages} from '@/hooks/use-packages';
import {ShareListItem, sharesApi} from '@/lib/api/shares';
import {SharesHeader, SharesTable} from '@/components/shares';
import {ShareDialog} from '@/components/share-dialog';

export default function SharesManagerPage() {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [shareToDelete, setShareToDelete] = useState<ShareListItem | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [shareToView, setShareToView] = useState<ShareListItem | null>(null);
    const [projectFilter, setProjectFilter] = useState<string>('all');
    const [packageFilter, setPackageFilter] = useState<string>('all');

    const {toast} = useToast();
    const queryClient = useQueryClient();

    // 基础数据
    const {data: projects = []} = useProjects();
    const {data: packagesData} = usePackages();
    const packages = packagesData?.data || [];

    // 当项目筛选改变时重置包筛选
    useEffect(() => {
        if (projectFilter !== 'all') {
            setPackageFilter('all');
        }
    }, [projectFilter]);

    // Fetch shares
    const {data: shares, isLoading, error} = useQuery({
        queryKey: ['shares'],
        queryFn: sharesApi.getAll,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Filter shares based on selected filters
    const filteredShares = useMemo(() => {
        if (!shares) return undefined;

        let filtered = shares;

        if (projectFilter !== 'all') {
            // Find project name by ID
            const selectedProject = projects.find(p => p.id === projectFilter);
            if (selectedProject) {
                filtered = filtered.filter(share => share.project_name === selectedProject.name);
            }
        }

        if (packageFilter !== 'all') {
            // Find package name by ID
            const selectedPackage = packages.find(p => p.id === packageFilter);
            if (selectedPackage) {
                filtered = filtered.filter(share => share.package_name === selectedPackage.name);
            }
        }

        return filtered;
    }, [shares, projectFilter, packageFilter, projects, packages]);

    // 获取总数用于显示
    const totalCount = filteredShares?.length || 0;

    // Delete share mutation
    const deleteMutation = useMutation({
        mutationFn: sharesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['shares']});
            toast({
                title: '删除成功',
                description: '分享链接已删除',
            });
            setDeleteDialogOpen(false);
            setShareToDelete(null);
        },
        onError: (error: any) => {
            toast({
                title: '删除失败',
                description: error.response?.data?.message || '删除分享链接时发生错误',
                variant: 'destructive',
            });
        },
    });

    const handleDeleteClick = (share: ShareListItem) => {
        setShareToDelete(share);
        setDeleteDialogOpen(true);
    };

    const handleViewClick = (share: ShareListItem) => {
        setShareToView(share);
        setViewDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (shareToDelete) {
            deleteMutation.mutate(shareToDelete.id);
        }
    };


    return (
        <div className="space-y-6">
            {/* Header */}
            <SharesHeader/>

            {/* Filters */}
            <ProjectPackageFilters
                projectFilter={projectFilter}
                packageFilter={packageFilter}
                totalCount={totalCount}
                countLabel="个分享"
                projects={projects}
                packages={packages}
                onProjectFilterChange={setProjectFilter}
                onPackageFilterChange={setPackageFilter}
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
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                            确定要删除这个分享链接吗？删除后，使用此链接的用户将无法再下载文件。
                            {shareToDelete && (
                                <div className="mt-2 p-2 bg-muted rounded text-sm">
                                    <p><strong>项目:</strong> {shareToDelete.project_name}</p>
                                    <p><strong>包:</strong> {shareToDelete.package_name}</p>
                                    <p><strong>版本:</strong> {shareToDelete.version}</p>
                                    <p><strong>分享码:</strong> {shareToDelete.code}</p>
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? '删除中...' : '确认删除'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* View Share Dialog */}
            {shareToView && (
                <ShareDialog
                    isOpen={viewDialogOpen}
                    onClose={() => {
                        setViewDialogOpen(false);
                        setShareToView(null);
                    }}
                    shareUrl={shareToView.share_url}
                    packageName={`${shareToView.package_name} (${shareToView.version})`}
                />
            )}
        </div>
    );
}