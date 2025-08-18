import { toast } from 'sonner';
import { apiClient } from '@/lib/api/api';
import type { UserRoleForm, UserPolicyForm } from '@/types';

export function usePermissionOperations() {
    // 统一的成功/错误处理
    const handleApiResponse = (response: any, successMessage: string, errorMessage: string) => {
        if (response.data && response.data.code === 0) {
            toast.success(successMessage);
            return true;
        } else {
            toast.error(response.data?.msg || errorMessage);
            return false;
        }
    };

    // 统一的错误处理
    const handleApiError = (error: any, errorMessage: string) => {
        console.error(errorMessage, error);
        toast.error(errorMessage);
        return false;
    };

    // 用户角色相关操作
    const userRoles = {
        add: async (formData: UserRoleForm, onRefresh: () => Promise<void>) => {
            try {
                const response = await apiClient.post('/api/v1/casbin/roles', formData);
                const success = handleApiResponse(response, '用户角色添加成功', '添加用户角色失败');
                if (success) {
                    await onRefresh();
                }
                return success;
            } catch (error) {
                return handleApiError(error, '添加用户角色失败');
            }
        },

        remove: async (userId: string, role: string, domain: string, onRefresh: () => Promise<void>) => {
            try {
                const response = await apiClient.delete('/api/v1/casbin/roles', {
                    data: { user_id: userId, role, tenant: domain }
                });
                const success = handleApiResponse(response, '用户角色删除成功', '删除用户角色失败');
                if (success) {
                    await onRefresh();
                }
                return success;
            } catch (error) {
                return handleApiError(error, '删除用户角色失败');
            }
        }
    };

    // 用户权限相关操作
    const userPermissions = {
        add: async (formData: UserPolicyForm, onRefresh: () => Promise<void>) => {
            try {
                const response = await apiClient.post('/api/v1/casbin/policies', formData);
                const success = handleApiResponse(response, '用户权限添加成功', '添加用户权限失败');
                if (success) {
                    await onRefresh();
                }
                return success;
            } catch (error) {
                return handleApiError(error, '添加用户权限失败');
            }
        },

        remove: async (userId: string, domain: string, object: string, action: string, onRefresh: () => Promise<void>) => {
            try {
                const response = await apiClient.delete('/api/v1/casbin/policies', {
                    data: { user_id: userId, tenant: domain, object, action }
                });
                const success = handleApiResponse(response, '用户权限删除成功', '删除用户权限失败');
                if (success) {
                    await onRefresh();
                }
                return success;
            } catch (error) {
                return handleApiError(error, '删除用户权限失败');
            }
        }
    };

    return {
        userRoles,
        userPermissions
    };
}