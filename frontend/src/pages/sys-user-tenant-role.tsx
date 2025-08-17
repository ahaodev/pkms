// 用户租户角色管理页面

import React, {useCallback, useMemo, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Page, PageContent, PageHeader} from '@/components/page';
import {Plus, Shield, Users} from 'lucide-react';
import {toast} from 'sonner';
import {useUsers} from '@/hooks/use-users';
import {useTenants} from '@/hooks/use-tenants';
import {useRoles} from '@/hooks/use-roles';
import {useAllUserTenantRoles, useRemoveUserTenantRole} from '@/hooks/use-user-tenant-role';
import {UserTenantRoleTable, AssignRoleDialog} from '@/components/sys-user-tenant-role';
import type {
    RemoveUserTenantRoleRequest,
    UserTenantRole as UserTenantRoleType,
} from '@/types/user-tenant-role';

const UserTenantRole: React.FC = () => {
    const {data: users = [], isLoading: usersLoading} = useUsers();
    const {data: tenants = [], isLoading: tenantsLoading} = useTenants();
    const {data: roles = [], isLoading: rolesLoading} = useRoles();

    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

    const {
        data: userTenantRoles = [],
        refetch,
        isLoading: rolesDataLoading
    } = useAllUserTenantRoles(selectedUserId);
    const removeRoleMutation = useRemoveUserTenantRole();

    // 使用 useMemo 优化查找函数
    const userMap = useMemo(() =>
        new Map(users.map(user => [user.id, user])), [users]
    );

    const tenantMap = useMemo(() =>
        new Map(tenants.map(tenant => [tenant.id, tenant])), [tenants]
    );

    const roleMap = useMemo(() =>
        new Map(roles.map(role => [role.id, role])), [roles]
    );

    // 优化后的获取函数
    const getUserName = useCallback((userId: string) => {
        return userMap.get(userId)?.name || userId;
    }, [userMap]);

    const getTenantName = useCallback((tenantId: string) => {
        return tenantMap.get(tenantId)?.name || tenantId;
    }, [tenantMap]);

    const getRoleName = useCallback((roleId: string) => {
        return roleMap.get(roleId)?.name || roleId;
    }, [roleMap]);

    const getRoleCode = useCallback((roleId: string) => {
        return roleMap.get(roleId)?.code || roleId;
    }, [roleMap]);

    // 移除用户租户角色
    const handleRemoveRole = useCallback(async (userTenantRole: UserTenantRoleType) => {
        const request: RemoveUserTenantRoleRequest = {
            user_id: userTenantRole.user_id,
            tenant_id: userTenantRole.tenant_id,
            role_id: userTenantRole.role_id,
        };

        try {
            await removeRoleMutation.mutateAsync(request);
            toast.success('角色移除成功');
            refetch();
        } catch (error: any) {
            toast.error(error.response?.data?.message || '角色移除失败');
        }
    }, [removeRoleMutation, refetch]);

    // 按租户分组用户角色 - 使用 useMemo 优化
    const groupedRoles = useMemo(() => {
        return userTenantRoles.reduce((acc, role) => {
            const tenantId = role.tenant_id;
            if (!acc[tenantId]) {
                acc[tenantId] = [];
            }
            acc[tenantId].push(role);
            return acc;
        }, {} as Record<string, UserTenantRoleType[]>);
    }, [userTenantRoles]);

    // 检查是否正在加载
    const isLoading = useMemo(() =>
            usersLoading || tenantsLoading || rolesLoading,
        [usersLoading, tenantsLoading, rolesLoading]
    );

    // 优化对话框状态处理
    const handleOpenAssignDialog = useCallback(() => {
        setIsAssignDialogOpen(true);
    }, []);

    const handleCloseAssignDialog = useCallback(() => {
        setIsAssignDialogOpen(false);
    }, []);

    const handleAssignSuccess = useCallback(() => {
        refetch();
        setIsAssignDialogOpen(false);
    }, [refetch]);

    return (
        <Page isLoading={isLoading}>
            <PageHeader
                title="用户租户角色管理"
                description="管理用户在不同租户中的角色分配"
                action={selectedUserId ? {
                    label: "分配角色",
                    onClick: handleOpenAssignDialog,
                    icon: Plus
                } : undefined}
            />

            <PageContent>
                {/* 用户选择 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5"/>
                            选择用户
                        </CardTitle>
                        <CardDescription>
                            选择要管理角色的用户
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 items-center">
                            <div className="flex-1">
                                <Label htmlFor="user-select">用户</Label>
                                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="请选择用户"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.name} ({user.id})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {selectedUserId && (
                                <div className="text-sm text-muted-foreground">
                                    已选择: <strong>{getUserName(selectedUserId)}</strong>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 用户角色列表 */}
                {selectedUserId && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5"/>
                                {getUserName(selectedUserId)} 的角色分配
                            </CardTitle>
                            <CardDescription>
                                用户在各个租户中的角色分配情况
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {rolesDataLoading ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    加载角色数据中...
                                </div>
                            ) : (
                                <UserTenantRoleTable
                                    groupedRoles={groupedRoles}
                                    getTenantName={getTenantName}
                                    getRoleName={getRoleName}
                                    getRoleCode={getRoleCode}
                                    onRemoveRole={handleRemoveRole}
                                    isRemoving={removeRoleMutation.isPending}
                                />
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* 分配角色对话框 */}
                <AssignRoleDialog
                    open={isAssignDialogOpen}
                    onOpenChange={handleCloseAssignDialog}
                    userId={selectedUserId}
                    onSuccess={handleAssignSuccess}
                />
            </PageContent>
        </Page>
    );
};

export default UserTenantRole;