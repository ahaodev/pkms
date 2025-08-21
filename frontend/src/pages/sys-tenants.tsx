import {useState} from 'react';
import {toast} from 'sonner';
import {useCreateTenant, useDeleteTenant, useTenantsWithPagination, useUpdateTenant} from '@/hooks/use-tenants';
import {Tenant} from '@/types/tenant';
import {TenantDialog, TenantHeader, TenantList, TenantUsersDialog} from '@/components/tenant';
import {Page, PageContent} from '@/components/page';
import {useI18n} from '@/contexts/i18n-context';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

export default function TenantsPage() {
    const {t} = useI18n();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);
    
    const {data: paginatedData, isLoading} = useTenantsWithPagination(currentPage, pageSize);
    const createTenantMutation = useCreateTenant();
    const updateTenantMutation = useUpdateTenant();
    const deleteTenantMutation = useDeleteTenant();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [viewingTenant, setViewingTenant] = useState<Tenant | null>(null);
    const [tenantName, setTenantName] = useState('');

    // 从分页数据中提取信息
    const tenants = paginatedData?.list || [];
    const totalItems = paginatedData?.total || 0;
    const totalPages = paginatedData?.total_pages || 1;

    const handleCreateTenant = async () => {
        if (!tenantName.trim()) {
            toast.error(t('tenant.nameRequired'));
            return;
        }

        try {
            await createTenantMutation.mutateAsync({name: tenantName});
            toast.success(t('tenant.createSuccess', {name: tenantName}));
            setIsCreateDialogOpen(false);
            setTenantName('');
            setCurrentPage(1); // Reset to first page
        } catch {
            toast.error(t('tenant.createError'));
        }
    };

    const handleEditTenant = (tenant: Tenant) => {
        setEditingTenant(tenant);
        setTenantName(tenant.name);
        setIsEditDialogOpen(true);
    };

    const handleUpdateTenant = async () => {
        if (!editingTenant || !tenantName.trim()) {
            toast.error(t('tenant.nameRequired'));
            return;
        }

        try {
            await updateTenantMutation.mutateAsync({
                id: editingTenant.id,
                update: {name: tenantName}
            });
            toast.success(t('tenant.updateSuccess', {name: tenantName}));
            setIsEditDialogOpen(false);
            setEditingTenant(null);
            setTenantName('');
        } catch {
            toast.error(t('tenant.updateError'));
        }
    };

    const handleDeleteTenant = async (tenant: Tenant) => {
        if (!confirm(t('tenant.deleteConfirm', {name: tenant.name}))) return;

        try {
            await deleteTenantMutation.mutateAsync(tenant.id);
            toast.success(t('tenant.deleteSuccess', {name: tenant.name}));
            // Reset pagination will be handled automatically by the hook
        } catch {
            toast.error(t('tenant.deleteError'));
        }
    };

    const closeDialogs = () => {
        setIsCreateDialogOpen(false);
        setIsEditDialogOpen(false);
        setIsUsersDialogOpen(false);
        setEditingTenant(null);
        setViewingTenant(null);
        setTenantName('');
    };

    return (
        <Page isLoading={isLoading}>
            <TenantHeader onCreateTenant={() => setIsCreateDialogOpen(true)}/>

            <PageContent>
                {/* 统计信息 */}
                <div className="mb-6">
                    <div className="text-sm text-muted-foreground">
                        {t('tenant.totalTenants',{ count: totalItems })}
                    </div>
                </div>

                <TenantList
                    tenants={tenants}
                    onEdit={handleEditTenant}
                    onDelete={handleDeleteTenant}
                    onViewUsers={(tenant) => {
                        setViewingTenant(tenant);
                        setIsUsersDialogOpen(true);
                    }}
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
                                    第 {currentPage} 页，共 {totalPages} 页 (总数: {totalItems})
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

                <TenantDialog
                    open={isCreateDialogOpen}
                    onClose={closeDialogs}
                    onSubmit={handleCreateTenant}
                    title={t('tenant.create')}
                    tenantForm={{name: tenantName}}
                    updateTenantForm={(updates) => setTenantName(updates.name || '')}
                />

                <TenantDialog
                    open={isEditDialogOpen}
                    onClose={closeDialogs}
                    onSubmit={handleUpdateTenant}
                    title={t('tenant.edit')}
                    isEdit={true}
                    tenantForm={{name: tenantName}}
                    updateTenantForm={(updates) => setTenantName(updates.name || '')}
                />

                <TenantUsersDialog
                    open={isUsersDialogOpen}
                    onClose={closeDialogs}
                    tenant={viewingTenant}
                />
            </PageContent>
        </Page>
    );
}