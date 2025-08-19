import {useState, useMemo, useEffect} from 'react';
import {toast} from 'sonner';
import {useCreateTenant, useDeleteTenant, useTenants, useUpdateTenant} from '@/hooks/use-tenants';
import {Tenant} from '@/types/tenant';
import {TenantDialog, TenantHeader, TenantList, TenantUsersDialog} from '@/components/tenant';
import {Page, PageContent} from '@/components/page';
import {useI18n} from '@/contexts/i18n-context';
import {usePagination} from '@/hooks/use-pagination';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
} from '@/components/ui/pagination';

export default function TenantsPage() {
    const {t} = useI18n();
    const {data: tenants, isLoading} = useTenants();
    const createTenantMutation = useCreateTenant();
    const updateTenantMutation = useUpdateTenant();
    const deleteTenantMutation = useDeleteTenant();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [viewingTenant, setViewingTenant] = useState<Tenant | null>(null);
    const [tenantName, setTenantName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // 分页状态
    const pagination = usePagination({
        initialPageSize: 20,
        defaultPageSize: 20
    });

    const filteredTenants = useMemo(() => {
        if (!tenants) return [];
        return tenants.filter((tenant: Tenant) => 
            tenant.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [tenants, searchTerm]);

    // Update pagination total items when filtered tenants change
    useEffect(() => {
        pagination.setTotalItems(filteredTenants.length);
    }, [filteredTenants.length, pagination]);

    // 获取当前页显示的租户数据
    const paginatedTenants = useMemo(() => {
        return pagination.getPageData(filteredTenants);
    }, [filteredTenants, pagination.currentPage, pagination.pageSize]);

    // 移除这个检查，让 Page 组件处理 loading 状态

    const handleCreateTenant = async () => {
        if (!tenantName.trim()) {
            toast.error(t('tenant.nameRequired'));
            return;
        }

        try {
            await createTenantMutation.mutateAsync({ name: tenantName });
            toast.success(t('tenant.createSuccess', { name: tenantName }));
            setIsCreateDialogOpen(false);
            setTenantName('');
            pagination.setPage(1); // Reset to first page
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
                update: { name: tenantName }
            });
            toast.success(t('tenant.updateSuccess', { name: tenantName }));
            setIsEditDialogOpen(false);
            setEditingTenant(null);
            setTenantName('');
        } catch {
            toast.error(t('tenant.updateError'));
        }
    };

    const handleDeleteTenant = async (tenant: Tenant) => {
        if (!confirm(t('tenant.deleteConfirm', { name: tenant.name }))) return;

        try {
            await deleteTenantMutation.mutateAsync(tenant.id);
            toast.success(t('tenant.deleteSuccess', { name: tenant.name }));
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
            <TenantHeader onCreateTenant={() => setIsCreateDialogOpen(true)} />
            
            <PageContent>

            {/* 筛选器 */}
            <div className="mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="搜索租户..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="text-sm text-muted-foreground">
                        总数: {filteredTenants.length}
                    </div>
                </div>
            </div>

            <TenantList
                tenants={paginatedTenants}
                onEdit={handleEditTenant}
                onDelete={handleDeleteTenant}
                onViewUsers={(tenant) => {
                    setViewingTenant(tenant);
                    setIsUsersDialogOpen(true);
                }}
            />
            
            {/* 分页组件 */}
            <div className="py-4">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious 
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (pagination.currentPage > 1) {
                                        pagination.setPage(pagination.currentPage - 1);
                                    }
                                }}
                                className={pagination.currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>
                        
                        <PaginationItem>
                            <span className="text-sm text-muted-foreground px-4">
                                第 {pagination.currentPage} 页，共 {pagination.totalPages} 页 (总数: {pagination.totalItems})
                            </span>
                        </PaginationItem>

                        <PaginationItem>
                            <PaginationNext 
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (pagination.currentPage < pagination.totalPages) {
                                        pagination.setPage(pagination.currentPage + 1);
                                    }
                                }}
                                className={pagination.currentPage >= pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>

            <TenantDialog
                open={isCreateDialogOpen}
                onClose={closeDialogs}
                onSubmit={handleCreateTenant}
                title={t('tenant.create')}
                tenantForm={{ name: tenantName }}
                updateTenantForm={(updates) => setTenantName(updates.name || '')}
            />

            <TenantDialog
                open={isEditDialogOpen}
                onClose={closeDialogs}
                onSubmit={handleUpdateTenant}
                title={t('tenant.edit')}
                isEdit={true}
                tenantForm={{ name: tenantName }}
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