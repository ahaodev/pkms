import React, {useState, useMemo} from 'react';
import {toast} from 'sonner';
import {useCreateTenant, useDeleteTenant, useTenants, useUpdateTenant} from '@/hooks/use-tenants';
import {Tenant} from '@/types/tenant';
import {TenantDialog, TenantHeader, TenantList, TenantUsersDialog} from '@/components/tenant';
import {Page, PageContent} from '@/components/page';
import {useI18n} from '@/contexts/i18n-context';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
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
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Calculate paginated data
    const paginatedData = useMemo(() => {
        const allTenants = tenants || [];
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedTenants = allTenants.slice(startIndex, endIndex);
        const totalPages = Math.ceil(allTenants.length / itemsPerPage);
        
        return {
            tenants: paginatedTenants,
            totalPages,
            totalItems: allTenants.length
        };
    }, [tenants, currentPage, itemsPerPage]);

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
            // Reset to first page after deletion to avoid empty page
            const newTotalItems = (tenants?.length || 1) - 1;
            const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            }
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

            <TenantList
                tenants={paginatedData.tenants}
                onEdit={handleEditTenant}
                onDelete={handleDeleteTenant}
                onViewUsers={(tenant) => {
                    setViewingTenant(tenant);
                    setIsUsersDialogOpen(true);
                }}
            />
            
            {paginatedData.totalPages > 1 && (
                <div className="mt-6">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                            
                            {Array.from({ length: paginatedData.totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    // Show first page, last page, current page, and pages around current
                                    return page === 1 || 
                                           page === paginatedData.totalPages || 
                                           Math.abs(page - currentPage) <= 1;
                                })
                                .map((page, index, array) => {
                                    // Add ellipsis if there's a gap
                                    const showEllipsisBefore = index > 0 && array[index - 1] < page - 1;
                                    
                                    return (
                                        <React.Fragment key={page}>
                                            {showEllipsisBefore && (
                                                <PaginationItem>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            )}
                                            <PaginationItem>
                                                <PaginationLink
                                                    onClick={() => setCurrentPage(page)}
                                                    isActive={currentPage === page}
                                                    className="cursor-pointer"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        </React.Fragment>
                                    );
                                })
                            }
                            
                            <PaginationItem>
                                <PaginationNext 
                                    onClick={() => setCurrentPage(prev => Math.min(paginatedData.totalPages, prev + 1))}
                                    className={currentPage === paginatedData.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                    
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        显示 {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, paginatedData.totalItems)} / {paginatedData.totalItems} 项
                    </div>
                </div>
            )}

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