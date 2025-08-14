import {useCallback, useEffect, useState} from 'react';
import {UserPlus, Users} from 'lucide-react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';
import {useAddUserToTenantWithRole, useTenantUsersWithRole} from '@/hooks/use-tenants';
import {useUsers} from '@/hooks/use-users';
import {Tenant, TenantUser} from '@/types/tenant';
import {User} from '@/types/user';
import {TenantUsersList} from './tenant-users-list';
import {useI18n} from '@/contexts/i18n-context';

interface TenantUsersDialogProps {
    open: boolean;
    onClose: () => void;
    tenant: Tenant | null;
}

const ROLES = [
    {value: 'user', label: 'tenant.readWrite', color: 'bg-green-100 text-green-800'},
    {value: 'viewer', label: 'tenant.readOnly', color: 'bg-gray-100 text-gray-800'},
];

export function TenantUsersDialog({open, onClose, tenant}: TenantUsersDialogProps) {
    const { t } = useI18n();
    const [showAddUser, setShowAddUser] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRole, setSelectedRole] = useState('user');

    const {data: tenantUsers, isLoading: isLoadingTenantUsers} = useTenantUsersWithRole(tenant?.id || '');
    const {data: allUsers} = useUsers();
    const addUserMutation = useAddUserToTenantWithRole();

    // 获取可添加的用户（排除已在租户中的用户）
    const availableUsers = allUsers?.filter((user: User) =>
        !(tenantUsers as TenantUser[])?.some((tenantUser: TenantUser) => tenantUser.user_id === user.id)
    ) || [];

    // 重置表单状态
    const resetAddForm = useCallback(() => {
        setSelectedUserId('');
        setSelectedRole('user');
        setShowAddUser(false);
    }, []);

    // 关闭对话框时重置状态
    useEffect(() => {
        if (!open) {
            resetAddForm();
        }
    }, [open, resetAddForm]);

    const handleAddUser = async () => {
        if (!tenant?.id || !selectedUserId) {
            toast.error(t('tenant.selectUser'), {
                description: t('tenant.selectUserDescription'),
            });
            return;
        }

        try {
            await addUserMutation.mutateAsync({
                tenantId: tenant.id,
                userId: selectedUserId,
                role: selectedRole,
            });

            toast.success(t('tenant.userAddedSuccess'), {
                description: t('tenant.userAddedSuccessDescription'),
            });

            resetAddForm();
        } catch (error) {
            console.error(error);
            toast.error(t('tenant.addFailed'), {
                description: t('tenant.addFailedDescription'),
            });
        }
    };


    if (!tenant) return null;

    return (
        <Dialog open={open} onOpenChange={onClose} modal={true}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5"/>
                        {t('tenant.userManagement')} - {tenant.name}
                    </DialogTitle>
                    <DialogDescription>
                        {t('tenant.userManagementDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto">
                    {/* 添加用户区域 */}
                    <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                        {!showAddUser ? (
                            <Button
                                onClick={() => setShowAddUser(true)}
                                className="w-full"
                                variant="outline"
                            >
                                <UserPlus className="h-4 w-4 mr-2"/>
                                {t('tenant.addUserToTenant')}
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">{t('tenant.selectUser')}</label>
                                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('tenant.selectUserPlaceholder')}/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableUsers.map((user: User) => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        {user.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">{t('tenant.selectRole')}</label>
                                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                                            <SelectTrigger>
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ROLES.map((role) => (
                                                    <SelectItem key={role.value} value={role.value}>
                                                        {t(role.label)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleAddUser}
                                        disabled={!selectedUserId || addUserMutation.isPending}
                                    >
                                        {addUserMutation.isPending ? t('tenant.adding') : t('tenant.confirmAdd')}
                                    </Button>
                                    <Button variant="outline" onClick={resetAddForm}>
                                        {t('common.cancel')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 用户列表 */}
                    <TenantUsersList
                        tenantId={tenant.id}
                        tenantUsers={tenantUsers as TenantUser[]}
                        isLoading={isLoadingTenantUsers}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}