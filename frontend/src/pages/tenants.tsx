import {useState} from 'react';
import {Shield} from 'lucide-react';
import {toast} from 'sonner';
import {useAuth} from '@/providers/auth-provider.tsx';
import {useCreateTenant, useDeleteTenant, useTenants, useUpdateTenant} from '@/hooks/use-tenants';
import {Tenant} from '@/types/tenant';
import {TenantDialog, TenantHeader, TenantList, TenantUsersDialog} from '@/components/tenant';
import {CustomSkeleton} from '@/components/custom-skeleton';

export default function TenantsPage() {
    const {hasRole} = useAuth();
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

    // 检查权限 - 只有管理员可以访问
    if (!hasRole('admin')) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Shield className="mx-auto h-12 w-12 text-muted-foreground"/>
                    <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
                        访问被拒绝
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        您没有权限访问租户管理页面
                    </p>
                </div>
            </div>
        );
    }

    const handleCreateTenant = async () => {
        if (!tenantName.trim()) {
            toast.error('租户名称为必填项');
            return;
        }

        try {
            await createTenantMutation.mutateAsync({ name: tenantName });
            toast.success(`租户 "${tenantName}" 已创建`);
            setIsCreateDialogOpen(false);
            setTenantName('');
        } catch {
            toast.error('租户创建失败，请重试');
        }
    };

    const handleEditTenant = (tenant: Tenant) => {
        setEditingTenant(tenant);
        setTenantName(tenant.name);
        setIsEditDialogOpen(true);
    };

    const handleUpdateTenant = async () => {
        if (!editingTenant || !tenantName.trim()) {
            toast.error('租户名称为必填项');
            return;
        }

        try {
            await updateTenantMutation.mutateAsync({
                id: editingTenant.id,
                update: { name: tenantName }
            });
            toast.success(`租户 "${tenantName}" 已更新`);
            setIsEditDialogOpen(false);
            setEditingTenant(null);
            setTenantName('');
        } catch {
            toast.error('租户更新失败，请重试');
        }
    };

    const handleDeleteTenant = async (tenant: Tenant) => {
        if (!confirm(`确定要删除租户 "${tenant.name}" 吗？此操作无法撤销。`)) return;

        try {
            await deleteTenantMutation.mutateAsync(tenant.id);
            toast.success(`租户 "${tenant.name}" 已删除`);
        } catch {
            toast.error('租户删除失败，请重试');
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
                title="创建新租户"
                tenantForm={{ name: tenantName }}
                updateTenantForm={(updates) => setTenantName(updates.name || '')}
            />

            <TenantDialog
                open={isEditDialogOpen}
                onClose={closeDialogs}
                onSubmit={handleUpdateTenant}
                title="编辑租户"
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