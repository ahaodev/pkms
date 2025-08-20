// 权限管理Hook

import {useCallback, useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useAuth} from '@/providers/auth-provider';
import {getUserPermissions} from '@/lib/api/auth';


/**
 * 权限管理Hook
 * 提供权限检查、菜单访问等功能
 */
export const usePermissions = () => {
    const {user, isAdmin: checkIsAdmin} = useAuth();

    // 获取用户权限数据（合并接口）
    const {data: userPermissions, isLoading} = useQuery({
        queryKey: ['userPermissions', user?.id],
        queryFn: () => getUserPermissions(user!.id),
        enabled: !!user,
        select: (data) => data.data,
        retry: (failureCount, error) => {
            // 如果是权限错误，不重试
            if (error && typeof error === 'object' && 'status' in error && error.status === 403) {
                return false;
            }
            return failureCount < 2;
        },
    });

    // 计算状态而不是通过useEffect更新
    const computedState = useMemo(() => ({
        buttonPermissions: userPermissions?.permissions?.flat() || [],
        menuPermissions: userPermissions?.menus?.map(menu => menu.path.replace('/', '')) || [],
        isLoading,
        error: null,
    }), [userPermissions, isLoading]);

    // 检查按钮权限
    const hasPermission = useCallback((permission: string): boolean => {
        if (!permission) return false;

        // 管理员拥有所有权限
        if (checkIsAdmin()) return true;

        return (computedState.buttonPermissions as string[]).includes(permission);
    }, [computedState.buttonPermissions, checkIsAdmin()]);

    // 检查多个权限（AND逻辑）
    const hasAllPermissions = useCallback((permissions: string[]): boolean => {
        return permissions.every(permission => hasPermission(permission));
    }, [hasPermission]);

    // 检查多个权限（OR逻辑）
    const hasAnyPermission = useCallback((permissions: string[]): boolean => {
        return permissions.some(permission => hasPermission(permission));
    }, [hasPermission]);

    // 检查菜单访问权限
    const hasMenuAccess = useCallback((path: string): boolean => {
        if (!path) return false;

        // 管理员拥有所有菜单权限
        if (checkIsAdmin()) return true;

        // 清理路径（去掉开头的斜杠）
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;

        return computedState.menuPermissions.includes(cleanPath);
    }, [computedState.menuPermissions, checkIsAdmin()]);

    // 检查当前路由权限
    const hasCurrentRouteAccess = useCallback((): boolean => {
        const currentPath = window.location.pathname;
        return hasMenuAccess(currentPath);
    }, [hasMenuAccess]);

    // 获取用户可访问的菜单列表
    const getAccessibleMenus = useCallback((allMenus: string[]): string[] => {
        if (checkIsAdmin()) return allMenus;

        return allMenus.filter(menu => hasMenuAccess(menu));
    }, [hasMenuAccess, checkIsAdmin()]);

    // 权限检查的便捷方法
    const can = useCallback((action: string, resource?: string): boolean => {
        const permissionKey = resource ? `${resource}:${action}` : action;
        return hasPermission(permissionKey);
    }, [hasPermission]);

    // 是否为管理员
    const isAdmin = checkIsAdmin();

    return {
        // 状态
        isLoading: computedState.isLoading,
        error: computedState.error,
        buttonPermissions: computedState.buttonPermissions,
        menuPermissions: computedState.menuPermissions,

        // 权限检查方法
        hasPermission,
        hasAllPermissions,
        hasAnyPermission,
        hasMenuAccess,
        hasCurrentRouteAccess,
        getAccessibleMenus,
        can,
        // 用户信息
        isAdmin,
        user,
    };
};