import React, {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {apiClient} from '@/lib/api/api';
import {UserPermissionsDialog} from '@/components/permissions';
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {PageHeader} from '@/components/ui/page-header';
import RoleManagement from '@/components/permissions/RoleManagement';
import UserManagement from '@/components/permissions/UserManagement';
import {CustomSkeleton} from '@/components/custom-skeleton';
import type {EnhancedPolicy, EnhancedRole, User, UserPermission} from '@/types';
import {useI18n} from '@/contexts/i18n-context';

const PermissionsPage: React.FC = () => {
    const {t} = useI18n();

    // State for data
    const [enhancedPolicies, setEnhancedPolicies] = useState<EnhancedPolicy[]>([]);
    const [enhancedRoles, setEnhancedRoles] = useState<EnhancedRole[]>([]);
    const [objects, setObjects] = useState<string[]>([]);
    const [actions, setActions] = useState<string[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);

    // UI state
    const [showUserPermissionsDialog, setShowUserPermissionsDialog] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            await Promise.all([
                fetchEnhancedPolicies(),
                fetchEnhancedRoles(),
                fetchObjects(),
                fetchActions(),
                fetchUsers(),
            ]);
        } catch (error) {
            console.error(error)
            toast.error(t('permission.fetchError'));
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEnhancedPolicies = async () => {
        try {
            const response = await apiClient.get('/api/v1/casbin/policies/enhanced');
            if (response.data && response.data.code === 0) {
                setEnhancedPolicies(response.data.data.policies || []);
            }
        } catch (error) {
            console.error( error);
        }
    };

    const fetchEnhancedRoles = async () => {
        try {
            const response = await apiClient.get('/api/v1/casbin/roles/enhanced');
            if (response.data && response.data.code === 0) {
                setEnhancedRoles(response.data.data.roles || []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchObjects = async () => {
        try {
            const response = await apiClient.get('/api/v1/casbin/objects');
            if (response.data && response.data.code === 0) {
                setObjects(response.data.data.objects || []);
            }
        } catch (error) {
            console.error( error);
        }
    };

    const fetchActions = async () => {
        try {
            const response = await apiClient.get('/api/v1/casbin/actions');
            if (response.data && response.data.code === 0) {
                setActions(response.data.data.actions || []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await apiClient.get('/api/v1/casbin/users');
            if (response.data && response.data.code === 0) {
                setUsers(response.data.data.users || []);
            }
        } catch (error) {
            console.error( error);
        }
    };

    const fetchUserPermissions = async (userId: string) => {
        try {
            const response = await apiClient.get(`/api/v1/casbin/users/${userId}/permissions`);
            if (response.data && response.data.code === 0) {
                return response.data.data;
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    };

    const handleRefreshPolicies = async () => {
        await fetchEnhancedPolicies();
    };

    const handleRefreshRoles = async () => {
        await fetchEnhancedRoles();
    };

    const handleShowUserPermissions = async (userId: string) => {
        const permissions = await fetchUserPermissions(userId);
        if (permissions) {
            setUserPermissions([permissions]);
            setSelectedUserId(userId);
            setShowUserPermissionsDialog(true);
        }
    };

    const handleCloseUserPermissionsDialog = () => {
        setShowUserPermissionsDialog(false);
        setUserPermissions([]);
        setSelectedUserId('');
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title={t('permission.title')}
                    description={t('permission.description')}
                />
                <CustomSkeleton type="table" rows={8} columns={4} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="权限管理"
                description="管理系统角色权限配置和用户权限分配"
            />

            <Tabs defaultValue="role-management" className="space-y-4">
                <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="role-management">{t('permission.roleManagement')}</TabsTrigger>
                    <TabsTrigger value="user-management">{t('permission.userManagement')}</TabsTrigger>
                </TabsList>

                <TabsContent value="role-management" className="space-y-4">
                    <RoleManagement
                        enhancedPolicies={enhancedPolicies}
                        objects={objects}
                        actions={actions}
                        onRefresh={handleRefreshPolicies}
                    />
                </TabsContent>

                <TabsContent value="user-management" className="space-y-4">
                    <UserManagement
                        enhancedRoles={enhancedRoles}
                        users={users}
                        onRefresh={handleRefreshRoles}
                        onShowUserPermissions={handleShowUserPermissions}
                    />
                </TabsContent>
            </Tabs>

            <UserPermissionsDialog
                isOpen={showUserPermissionsDialog}
                onClose={handleCloseUserPermissionsDialog}
                userPermissions={userPermissions}
                selectedUserId={selectedUserId}
            />
        </div>
    );
};

export default PermissionsPage;