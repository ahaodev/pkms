import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/api';
import {
    RolePermissionsConfig,
    UserRoleAssignment,
    UserPermissionsConfig,
    UserPermissionsDialog,
    PermissionsHeader,
    PermissionsTabs
} from '@/components/permissions';
import type {
    EnhancedPolicy,
    EnhancedRole,
    User,
    UserPermission
} from '@/types';

const PermissionsPage: React.FC = () => {
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

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            await Promise.all([
                fetchEnhancedPolicies(),
                fetchEnhancedRoles(),
                fetchObjects(),
                fetchActions(),
                fetchUsers(),
            ]);
        } catch (error) {
            console.error('获取数据失败:', error);
            toast.error('获取数据失败');
        }
    };

    const fetchEnhancedPolicies = async () => {
        try {
            const response = await apiClient.get('/api/v1/casbin/policies/enhanced');
            if (response.data && response.data.code === 0) {
                setEnhancedPolicies(response.data.data.policies || []);
            }
        } catch (error) {
            console.error('获取增强策略失败:', error);
        }
    };

    const fetchEnhancedRoles = async () => {
        try {
            const response = await apiClient.get('/api/v1/casbin/roles/enhanced');
            if (response.data && response.data.code === 0) {
                setEnhancedRoles(response.data.data.roles || []);
            }
        } catch (error) {
            console.error('获取增强角色失败:', error);
        }
    };

    const fetchObjects = async () => {
        try {
            const response = await apiClient.get('/api/v1/casbin/objects');
            if (response.data && response.data.code === 0) {
                setObjects(response.data.data.objects || []);
            }
        } catch (error) {
            console.error('获取对象失败:', error);
        }
    };

    const fetchActions = async () => {
        try {
            const response = await apiClient.get('/api/v1/casbin/actions');
            if (response.data && response.data.code === 0) {
                setActions(response.data.data.actions || []);
            }
        } catch (error) {
            console.error('获取操作失败:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await apiClient.get('/api/v1/casbin/users');
            if (response.data && response.data.code === 0) {
                setUsers(response.data.data.users || []);
            }
        } catch (error) {
            console.error('获取用户失败:', error);
        }
    };

    const fetchUserPermissions = async (userId: string) => {
        try {
            const response = await apiClient.get(`/api/v1/casbin/users/${userId}/permissions`);
            if (response.data && response.data.code === 0) {
                return response.data.data;
            }
        } catch (error) {
            console.error('获取用户权限失败:', error);
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

    return (
        <div className="space-y-6">
            <PermissionsHeader 
                title="权限管理" 
                description="管理系统角色权限配置和用户权限分配" 
            />

            <PermissionsTabs
                defaultValue="role-permissions"
                rolePermissionsContent={
                    <RolePermissionsConfig
                        enhancedPolicies={enhancedPolicies}
                        objects={objects}
                        actions={actions}
                        onRefresh={handleRefreshPolicies}
                    />
                }
                userRolesContent={
                    <UserRoleAssignment
                        enhancedRoles={enhancedRoles}
                        users={users}
                        onRefresh={handleRefreshRoles}
                        onShowUserPermissions={handleShowUserPermissions}
                    />
                }
                userPermissionsContent={
                    <UserPermissionsConfig
                        enhancedPolicies={enhancedPolicies}
                        users={users}
                        objects={objects}
                        actions={actions}
                        onRefresh={handleRefreshPolicies}
                        onShowUserPermissions={handleShowUserPermissions}
                    />
                }
            />

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