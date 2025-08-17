// 权限管理Hook

import React, { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { staticMenuApi } from '@/lib/api/static-menu';


/**
 * 权限管理Hook
 * 提供权限检查、菜单访问等功能
 */
export const usePermissions = () => {
  const { user, isAdmin: checkIsAdmin } = useAuth();

  // 获取用户按钮权限
  const { data: buttonPermissions = [], isLoading: buttonLoading } = useQuery({
    queryKey: ['userButtonPermissions', user?.id],
    queryFn: staticMenuApi.getUserButtonPermissions,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    gcTime: 10 * 60 * 1000, // 10分钟缓存
    retry: (failureCount, error) => {
      // 如果是权限错误，不重试
      if (error && typeof error === 'object' && 'status' in error && error.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // 获取侧边栏权限（菜单权限）
  const { data: sidebarData, isLoading: menuLoading } = useQuery({
    queryKey: ['sidebarPermissions', user?.id],
    queryFn: staticMenuApi.getSidebarPermissions,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  // 计算状态而不是通过useEffect更新
  const computedState = useMemo(() => ({
    buttonPermissions: buttonPermissions || [],
    menuPermissions: (sidebarData as { sidebar?: string[] })?.sidebar || [],
    isLoading: buttonLoading || menuLoading,
    error: null,
  }), [buttonPermissions, sidebarData, buttonLoading, menuLoading]);

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
    
    // 常用权限检查
    canCreateUser: () => can('create', 'user'),
    canEditUser: () => can('update', 'user'),
    canDeleteUser: () => can('delete', 'user'),
    canViewUsers: () => can('read', 'user'),
    
    canCreateProject: () => can('create', 'project'),
    canEditProject: () => can('update', 'project'),
    canDeleteProject: () => can('delete', 'project'),
    canViewProjects: () => can('read', 'project'),
    
    canManageRoles: () => can('manage', 'role'),
    canManageMenus: () => can('manage', 'menu'),
    canManagePermissions: () => can('manage', 'permission'),
  };
};

/**
 * 权限检查的工具函数
 */
export const withPermission = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  permission: string,
  fallback?: React.ComponentType<any>
) => {
  return (props: T) => {
    const { hasPermission, isAdmin } = usePermissions();
    
    if (isAdmin || hasPermission(permission)) {
      return <Component {...props} />;
    }
    
    if (fallback) {
      const Fallback = fallback;
      return <Fallback />;
    }
    
    return null;
  };
};