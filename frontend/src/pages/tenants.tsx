import {useState} from 'react';
import {toast} from 'sonner';
import {useCreateTenant, useDeleteTenant, useTenants, useUpdateTenant} from '@/hooks/use-tenants';
import {Tenant} from '@/types/tenant';
import {TenantDialog, TenantHeader, TenantList, TenantUsersDialog} from '@/components/tenant';
import {CustomSkeleton} from '@/components/custom-skeleton';
import {useI18n} from '@/contexts/i18n-context';

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

    if (isLoading) {
        return (
            <div className="space-y-6">
                <TenantHeader onCreateTenant={() => setIsCreateDialogOpen(true)}/>
                <CustomSkeleton type="table" rows={5} columns={4} />
            </div>
        );
    }

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
        <div className="space-y-6">
            <TenantHeader onCreateTenant={() => setIsCreateDialogOpen(true)} />

            <TenantList
                tenants={tenants || []}
                onEdit={handleEditTenant}
                onDelete={handleDeleteTenant}
                onViewUsers={(tenant) => {
                    setViewingTenant(tenant);
                    setIsUsersDialogOpen(true);
                }}
            />

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
        </div>
    );
}