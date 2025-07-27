import {useCallback, useState} from 'react';
import {Shield} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import {useAuth} from '@/providers/auth-provider.tsx';
import {useCreateTenant, useDeleteTenant, useTenants, useUpdateTenant} from '@/hooks/use-tenants';
import {CreateTenantRequest, Tenant, UpdateTenantRequest} from '@/types/tenant';
import {TenantDialog, TenantHeader, TenantList, TenantUsersDialog} from '@/components/tenant';

/**
 * 租户管理页面：管理系统租户，分配用户权限
 */

interface TenantFormData {
    name: string;
}

export default function TenantsPage() {
    const {toast} = useToast();
    const {isAdmin} = useAuth();

    const {data: tenants, isLoading} = useTenants();
    const createTenantMutation = useCreateTenant();
    const updateTenantMutation = useUpdateTenant();
    const deleteTenantMutation = useDeleteTenant();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [viewingTenant, setViewingTenant] = useState<Tenant | null>(null);

    const [tenantForm, setTenantForm] = useState<TenantFormData>({
        name: '',
    });

    // 表单状态更新函数
    const updateTenantForm = useCallback((updates: Partial<TenantFormData>) => {
        setTenantForm(prev => ({...prev, ...updates}));
    }, []);

    // 重置表单
    const resetForm = useCallback(() => {
        setTenantForm({
            name: '',
        });
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
                </div>
            </div>
        );
    }

    // 检查权限 - 只有管理员可以访问
    if (!isAdmin()) {
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
        if (!tenantForm.name) {
            toast({
                variant: 'destructive',
                title: '请填写必填字段',
                description: '租户名称为必填项。',
            });
            return;
        }

        try {
            const createRequest: CreateTenantRequest = {
                name: tenantForm.name,
            };

            await createTenantMutation.mutateAsync(createRequest);

            toast({
                title: '租户创建成功',
                description: `租户 "${tenantForm.name}" 已创建。`,
            });

            setIsCreateDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error(error)
            toast({
                variant: 'destructive',
                title: '创建失败',
                description:'租户创建失败，请重试。',
            });
        }
    };

    const handleEditTenant = (tenant: Tenant) => {
        setEditingTenant(tenant);
        setTenantForm({
            name: tenant.name,
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdateTenant = async () => {
        if (!editingTenant || !tenantForm.name) {
            toast({
                variant: 'destructive',
                title: '请填写必填字段',
                description: '租户名称为必填项。',
            });
            return;
        }

        try {
            const updateRequest: UpdateTenantRequest = {
                name: tenantForm.name,
            };

            await updateTenantMutation.mutateAsync({
                id: editingTenant.id,
                update: updateRequest
            });

            toast({
                title: '租户更新成功',
                description: `租户 "${tenantForm.name}" 已更新。`,
            });

            setIsEditDialogOpen(false);
            setEditingTenant(null);
            resetForm();
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: '更新失败',
                description:  '租户更新失败，请重试。',
            });
        }
    };

    const handleDeleteTenant = async (tenant: Tenant) => {
        if (!confirm(`确定要删除租户 "${tenant.name}" 吗？此操作无法撤销。`)) {
            return;
        }

        try {
            await deleteTenantMutation.mutateAsync(tenant.id);
            toast({
                title: '租户删除成功',
                description: `租户 "${tenant.name}" 已删除。`,
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: '删除失败',
                description:'租户删除失败，请重试。',
            });
        }
    };

    const handleViewUsers = (tenant: Tenant) => {
        setViewingTenant(tenant);
        setIsUsersDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* 页面头部 */}
            <TenantHeader onCreateTenant={() => setIsCreateDialogOpen(true)}/>

            {/* 租户列表 */}
            <TenantList
                tenants={tenants || []}
                onEdit={handleEditTenant}
                onDelete={handleDeleteTenant}
                onViewUsers={handleViewUsers}
            />

            {/* 创建租户对话框 */}
            <TenantDialog
                open={isCreateDialogOpen}
                onClose={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                }}
                onSubmit={handleCreateTenant}
                title="创建新租户"
                tenantForm={tenantForm}
                updateTenantForm={updateTenantForm}
            />

            {/* 编辑租户对话框 */}
            <TenantDialog
                open={isEditDialogOpen}
                onClose={() => {
                    setIsEditDialogOpen(false);
                    setEditingTenant(null);
                    resetForm();
                }}
                onSubmit={handleUpdateTenant}
                title="编辑租户"
                isEdit={true}
                tenantForm={tenantForm}
                updateTenantForm={updateTenantForm}
            />

            {/* 租户用户管理对话框 */}
            <TenantUsersDialog
                open={isUsersDialogOpen}
                onClose={() => {
                    setIsUsersDialogOpen(false);
                    setViewingTenant(null);
                }}
                tenant={viewingTenant}
            />
        </div>
    );
}