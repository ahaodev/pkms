import {CheckCircle, Trash2, Users, XCircle} from 'lucide-react';
import {EmptyList} from '@/components/empty-list.tsx';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {toast} from 'sonner';
import {useRemoveUserFromTenant, useUpdateTenantUserRole} from '@/hooks/use-tenants';
import {TenantUser} from '@/types/tenant';
import {useI18n} from '@/contexts/i18n-context';

interface TenantUsersListProps {
    tenantId: string;
    tenantUsers: TenantUser[] | undefined;
    isLoading: boolean;
}

const ROLES = [
    {value: 'admin', label: 'user.admin', color: 'bg-red-100 text-red-800'},
    {value: 'owner', label: 'tenant.owner', color: 'bg-blue-100 text-blue-800'},
    {value: 'user', label: 'tenant.readWrite', color: 'bg-green-100 text-green-800'},
    {value: 'viewer', label: 'tenant.readOnly', color: 'bg-gray-100 text-gray-800'},
];

export function TenantUsersList({tenantId, tenantUsers, isLoading}: TenantUsersListProps) {
    const { t } = useI18n();
    const updateRoleMutation = useUpdateTenantUserRole();
    const removeUserMutation = useRemoveUserFromTenant();

    const handleUpdateRole = async (userId: string, newRole: string) => {
        try {
            await updateRoleMutation.mutateAsync({
                tenantId,
                userId,
                role: newRole,
                isActive: true,
            });

            toast.success(t('tenant.roleUpdateSuccess'), {
                description: t('tenant.roleUpdateSuccessDescription'),
            });
        } catch (error) {
            console.error(error);
            toast.error(t('tenant.updateFailed'), {
                description: t('tenant.roleUpdateFailedDescription'),
            });
        }
    };

    const handleRemoveUser = async (userId: string, userName: string) => {
        if (!confirm(t('tenant.removeUserConfirm', { userName }))) {
            return;
        }

        try {
            await removeUserMutation.mutateAsync({
                tenantId,
                userId,
            });

            toast.success(t('tenant.userRemoveSuccess'), {
                description: t('tenant.userRemoveSuccessDescription'),
            });
        } catch (error) {
            console.error(error);
            toast.error(t('tenant.removeFailed'), {
                description: t('tenant.userRemoveFailedDescription'),
            });
        }
    };

    if (isLoading) {
        return (
            <div className="border rounded-lg">
                <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-sm text-muted-foreground">{t('tenant.loadingUserList')}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!tenantUsers || tenantUsers.length === 0) {
        return (
            <EmptyList
                icon={Users}
                title={t('tenant.noUsers')}
                description={t('tenant.noUsersDescription')}
                className="border rounded-lg"
            />
        );
    }

    // 对用户列表进行排序：admin 排在最前面，然后是 owner
    const sortedTenantUsers = [...tenantUsers].sort((a, b) => {
        const roleOrder = {admin: 0, owner: 1, user: 2, viewer: 3};
        const aOrder = roleOrder[a.role as keyof typeof roleOrder] ?? 999;
        const bOrder = roleOrder[b.role as keyof typeof roleOrder] ?? 999;
        return aOrder - bOrder;
    });

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('user.name')}</TableHead>
                        <TableHead>{t('user.role')}</TableHead>
                        <TableHead>{t('common.status')}</TableHead>
                        <TableHead>{t('common.createdAt')}</TableHead>
                        <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedTenantUsers.map((user: TenantUser) => {
                        const isProtectedUser = user.role === 'admin' || user.role === 'owner';
                        const isAdmin = user.role === 'admin';

                        return (
                            <TableRow key={user.user_id}>
                                <TableCell className="font-medium">{user.username}</TableCell>
                                <TableCell>
                                    {isProtectedUser ? (
                                        <Badge
                                            className={isAdmin ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}>
                                            {isAdmin ? t('user.admin') : t('tenant.owner')}
                                        </Badge>
                                    ) : (
                                        <Select
                                            value={user.role}
                                            onValueChange={(newRole) => handleUpdateRole(user.user_id, newRole)}
                                            disabled={updateRoleMutation.isPending}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ROLES.filter(role => role.value !== 'admin' && role.value !== 'owner').map((role) => (
                                                    <SelectItem key={role.value} value={role.value}>
                                                        {t(role.label)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {user.is_active ? (
                                        <Badge className="bg-green-100 text-green-800">
                                            <CheckCircle className="h-3 w-3 mr-1"/>
                                            {t('tenant.active')}
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-gray-100 text-gray-800">
                                            <XCircle className="h-3 w-3 mr-1"/>
                                            {t('tenant.disabled')}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {new Date(user.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    {!isProtectedUser && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveUser(user.user_id, user.username)}
                                            disabled={removeUserMutation.isPending}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}