import {useEffect, useMemo, useState} from 'react';
import {ClientAccessDialog, ClientAccessHeader, ClientAccessList, TokenDisplayDialog} from '@/components/client-access';
import {ProjectPackageFilters} from '@/components/project-package-filters';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {AlertTriangle} from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    useClientAccessListWithPagination,
    useCreateClientAccess,
    useDeleteClientAccess,
    useRegenerateToken,
    useToggleClientAccessStatus,
    useUpdateClientAccess
} from '@/hooks/use-client-access';
import {useAllProjects} from '@/hooks/use-projects';
import {usePackages} from '@/hooks/use-packages';
import type {
    ClientAccess,
    ClientAccessFilters as Filters,
    CreateClientAccessRequest,
    UpdateClientAccessRequest
} from '@/types/client-access';
import {useI18n} from '@/contexts/i18n-context';

export default function ClientAccessPage() {
    const {t} = useI18n();
    const [projectFilter, setProjectFilter] = useState<string>('all');
    const [packageFilter, setPackageFilter] = useState<string>('all');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingClientAccess, setEditingClientAccess] = useState<ClientAccess | undefined>();
    const [viewingToken, setViewingToken] = useState<ClientAccess | null>(null);

    // 分页状态
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);

    // 基础数据
    const {data: projects = []} = useAllProjects();
    const {data: packagesData} = usePackages();
    const packages = packagesData?.data || [];

    // 构建筛选条件给API使用
    const filters = useMemo<Filters>(() => ({
        project_id: projectFilter === 'all' ? undefined : projectFilter,
        package_id: packageFilter === 'all' ? undefined : packageFilter,
    }), [projectFilter, packageFilter]);

    // 当项目筛选改变时重置包筛选和页码
    useEffect(() => {
        if (projectFilter !== 'all') {
            setPackageFilter('all');
        }
        setCurrentPage(1); // Reset to first page when filters change
    }, [projectFilter]);

    // 当包筛选改变时重置页码
    useEffect(() => {
        setCurrentPage(1);
    }, [packageFilter]);

    // API hooks - 使用服务器端分页
    const {
        data: paginatedData,
        isLoading,
        error
    } = useClientAccessListWithPagination(filters, currentPage, pageSize);

    const createMutation = useCreateClientAccess();
    const updateMutation = useUpdateClientAccess();
    const deleteMutation = useDeleteClientAccess();
    const toggleStatusMutation = useToggleClientAccessStatus();
    const regenerateTokenMutation = useRegenerateToken();

    // 从分页数据中提取信息
    const clientAccesses = paginatedData?.list || [];
    const totalCount = paginatedData?.total || 0;
    const totalPages = paginatedData?.total_pages || 1;

    const handleCreateClick = () => {
        setShowCreateDialog(true);
    };

    const handleEdit = (clientAccess: ClientAccess) => {
        setEditingClientAccess(clientAccess);
    };

    const handleViewToken = (clientAccess: ClientAccess) => {
        setViewingToken(clientAccess);
    };

    const handleCreate = async (data: CreateClientAccessRequest) => {
        await createMutation.mutateAsync(data);
        setCurrentPage(1); // Reset to first page
    };

    const handleUpdate = async (data: UpdateClientAccessRequest) => {
        if (!editingClientAccess) return;
        await updateMutation.mutateAsync({
            id: editingClientAccess.id,
            data,
        });
    };

    const handleDelete = async (id: string) => {
        await deleteMutation.mutateAsync(id);
    };

    const handleToggleStatus = async (id: string, isActive: boolean) => {
        await toggleStatusMutation.mutateAsync({id, isActive});
    };

    const handleRegenerateToken = async (id: string) => {
        await regenerateTokenMutation.mutateAsync(id);
    };

    // 错误处理
    if (error) {
        return (
            <div className="space-y-6">
                <ClientAccessHeader onCreateClick={handleCreateClick}/>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4"/>
                    <AlertDescription>
                        {t('clientAccess.loadError')}: {String(error) || t('clientAccess.unknownError')}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <ClientAccessHeader onCreateClick={handleCreateClick}/>

            {/* 筛选组件 */}
            <ProjectPackageFilters
                projectFilter={projectFilter}
                packageFilter={packageFilter}
                totalCount={totalCount}
                countLabel={t('clientAccess.accessCount')}
                projects={projects}
                packages={packages}
                onProjectFilterChange={setProjectFilter}
                onPackageFilterChange={setPackageFilter}
            />

            {/* 列表组件 */}
            <ClientAccessList
                clientAccesses={clientAccesses}
                loading={isLoading}
                error={error ? String(error) : undefined}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onRegenerateToken={handleRegenerateToken}
                onViewToken={handleViewToken}
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

            {/* 创建/编辑对话框 */}
            <ClientAccessDialog
                open={showCreateDialog || !!editingClientAccess}
                onOpenChange={(open) => {
                    if (!open) {
                        setShowCreateDialog(false);
                        setEditingClientAccess(undefined);
                    }
                }}
                clientAccess={editingClientAccess}
                onSubmit={editingClientAccess
                    ? (data) => handleUpdate(data as UpdateClientAccessRequest)
                    : (data) => handleCreate(data as CreateClientAccessRequest)
                }
                loading={createMutation.isPending || updateMutation.isPending}
            />

            {/* 令牌显示对话框 */}
            <TokenDisplayDialog
                open={!!viewingToken}
                onOpenChange={(open) => !open && setViewingToken(null)}
                clientAccess={viewingToken}
            />
        </div>
    );
}