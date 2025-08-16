// 动态菜单管理Hook
// 根据gin-admin分析实现的动态菜单获取和管理

import React, { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { menuApi } from '@/lib/api/menu';
import { useAuth } from '@/providers/auth-provider';
import type { MenuTreeNode } from '@/types/menu';
import { 
  BarChart3, 
  Boxes, 
  Rocket, 
  Shield, 
  Share2, 
  Settings, 
  Globe, 
  Users, 
  Lock, 
  Menu, 
  UserCheck,
  Home,
  FolderTree,
  Package,
  Building2,
  Key,
  LayoutGrid
} from 'lucide-react';


/**
 * 动态菜单管理Hook
 * 实现gin-admin式的动态菜单获取和渲染
 */
export const useDynamicMenus = () => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // 获取用户菜单树（根据权限过滤）
  const { 
    data: userMenuTree = [], 
    isLoading: menuLoading,
    error: menuError,
    refetch: refetchMenus
  } = useQuery({
    queryKey: ['userMenuTree', user?.id],
    queryFn: menuApi.getUserMenuTree,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    gcTime: 10 * 60 * 1000, // 10分钟缓存
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error && error.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // 获取完整菜单树（管理员用）
  const { 
    data: allMenuTree = [],
    isLoading: allMenuLoading 
  } = useQuery({
    queryKey: ['allMenuTree'],
    queryFn: menuApi.getMenuTree,
    enabled: !!user && isAdmin,
    staleTime: 10 * 60 * 1000, // 10分钟缓存
    gcTime: 15 * 60 * 1000, // 15分钟缓存
  });

  // 获取用户权限列表
  const { 
    data: userPermissions = [] 
  } = useQuery({
    queryKey: ['userPermissions', user?.id],
    queryFn: menuApi.getUserPermissions,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // 计算状态而不是通过useEffect更新
  const computedState = useMemo(() => ({
    userMenus: userMenuTree || [],
    allMenus: allMenuTree || [],
    isLoading: menuLoading || (isAdmin() ? allMenuLoading : false),
    error: menuError ? '获取菜单失败' : null,
    permissions: userPermissions || [],
  }), [userMenuTree, allMenuTree, menuLoading, allMenuLoading, menuError, userPermissions, isAdmin]);

  // 刷新菜单数据
  const refreshMenus = useCallback(async () => {
    await Promise.all([
      refetchMenus(),
      queryClient.invalidateQueries({ queryKey: ['allMenuTree'] }),
      queryClient.invalidateQueries({ queryKey: ['userPermissions'] }),
    ]);
  }, [refetchMenus, queryClient]);

  // 查找菜单项
  const findMenuItem = useCallback((path: string, menus?: MenuTreeNode[]): MenuTreeNode | null => {
    const searchMenus = menus || computedState.userMenus || [];
    for (const menu of searchMenus) {
      if (menu.path === path) {
        return menu;
      }
      if (menu.children) {
        const found = findMenuItem(path, menu.children);
        if (found) return found;
      }
    }
    return null;
  }, [computedState.userMenus]);

  // 获取面包屑路径
  const getBreadcrumbs = useCallback((path: string): MenuTreeNode[] => {
    const breadcrumbs: MenuTreeNode[] = [];
    
    const findPath = (menus: MenuTreeNode[], targetPath: string, currentPath: MenuTreeNode[] = []): boolean => {
      for (const menu of menus) {
        const newPath = [...currentPath, menu];
        
        if (menu.path === targetPath) {
          breadcrumbs.push(...newPath);
          return true;
        }
        
        if (menu.children && findPath(menu.children, targetPath, newPath)) {
          return true;
        }
      }
      return false;
    };
    
    findPath(computedState.userMenus || [], path);
    return breadcrumbs;
  }, [computedState.userMenus]);

  // 检查菜单权限
  const hasMenuPermission = useCallback((menuPath: string): boolean => {
    if (isAdmin()) return true;
    
    const menu = findMenuItem(menuPath);
    return !!menu;
  }, [findMenuItem, isAdmin]);

  // 检查按钮权限
  const hasButtonPermission = useCallback((permissionKey: string): boolean => {
    if (isAdmin()) return true;
    
    return computedState.permissions.includes(permissionKey);
  }, [computedState.permissions, isAdmin]);

  // 获取扁平化的菜单列表（用于路由配置）
  const flatMenus = useMemo(() => {
    const flatten = (menus: MenuTreeNode[]): MenuTreeNode[] => {
      const result: MenuTreeNode[] = [];
      
      for (const menu of menus) {
        if (menu.path) {
          result.push(menu);
        }
        if (menu.children) {
          result.push(...flatten(menu.children));
        }
      }
      
      return result;
    };
    
    return flatten(computedState.userMenus);
  }, [computedState.userMenus]);

  // 获取可访问的路径列表
  const accessiblePaths = useMemo(() => {
    return flatMenus.map(menu => menu.path).filter(Boolean) as string[];
  }, [flatMenus]);

  // 构建导航项（用于侧边栏渲染）
  const navigationItems = useMemo(() => {
    return computedState.userMenus.map(menu => ({
      id: menu.id,
      name: menu.name,
      path: menu.path,
      icon: menu.icon,
      component: menu.component,
      sort: menu.sort,
      visible: menu.visible,
      children: menu.children,
      actions: menu.actions,
      is_system: menu.is_system,
      created_at: menu.created_at,
      updated_at: menu.updated_at,
    }));
  }, [computedState.userMenus]);

  // 获取当前菜单信息
  const getCurrentMenu = useCallback((currentPath: string): MenuTreeNode | null => {
    // 先尝试精确匹配
    let menu = findMenuItem(currentPath);
    
    // 如果没找到，尝试模糊匹配（处理动态路由）
    if (!menu) {
      for (const flatMenu of flatMenus) {
        if (flatMenu.path && currentPath.startsWith(flatMenu.path)) {
          menu = flatMenu;
          break;
        }
      }
    }
    
    return menu;
  }, [findMenuItem, flatMenus]);

  return {
    // 状态
    isLoading: computedState.isLoading,
    error: computedState.error,
    userMenus: computedState.userMenus,
    allMenus: computedState.allMenus,
    permissions: computedState.permissions,
    
    // 操作方法
    refreshMenus,
    findMenuItem,
    getBreadcrumbs,
    getCurrentMenu,
    
    // 权限检查
    hasMenuPermission,
    hasButtonPermission,
    
    // 导航数据
    navigationItems,
    flatMenus,
    accessiblePaths,
  };
};

/**
 * 菜单图标映射
 * 将数据库中的图标名称映射到实际的图标组件
 */
export const getMenuIcon = (iconName?: string): React.ReactNode => {
  // 使用ES6导入的图标组件
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'BarChart3': BarChart3,
    'Boxes': Boxes,
    'Rocket': Rocket,
    'Shield': Shield,
    'Share2': Share2,
    'Settings': Settings,
    'Globe': Globe,
    'Users': Users,
    'Lock': Lock,
    'Menu': Menu,
    'UserCheck': UserCheck,
    'Home': Home,
    'FolderTree': FolderTree,
    'Package': Package,
    'Building2': Building2,
    'Key': Key,
    'LayoutGrid': LayoutGrid,
  };

  const IconComponent = iconMap[iconName || 'LayoutGrid'] || LayoutGrid;
  return React.createElement(IconComponent, { className: 'h-5 w-5' });
};

/**
 * 菜单权限检查工具函数
 */
export const withMenuPermission = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  menuPath: string,
  fallback?: React.ComponentType<any>
) => {
  return (props: T) => {
    const { hasMenuPermission } = useDynamicMenus();
    
    if (hasMenuPermission(menuPath)) {
      return <Component {...props} />;
    }
    
    if (fallback) {
      const Fallback = fallback;
      return <Fallback />;
    }
    
    return null;
  };
};