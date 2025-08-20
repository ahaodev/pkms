// 静态导航组件
// 从后端获取菜单数据并渲染

import { memo, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  FolderTree, 
  Rocket, 
  Share2, 
  Users, 
  Building2, 
  Settings,
  UserCheck,
  ShieldCheck,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { getUserPermissions } from '@/lib/api/auth';
import type { MenuItem } from '@/types/user';
import { useMenuTranslation } from '@/lib/utils/menu-i18n';
import { useI18n } from '@/contexts/i18n-context';

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Home': Home,
  'FolderTree': FolderTree,
  'Rocket': Rocket,
  'Share2': Share2,
  'Users': Users,
  'Building2': Building2,
  'Settings': Settings,
  'UserCheck': UserCheck,
  'ShieldCheck': ShieldCheck,
  'LayoutGrid': LayoutGrid,
};

interface StaticNavItemProps {
  menu: MenuItem;
  onClick?: () => void;
}

/**
 * 静态导航项组件
 */
const StaticNavItem = memo<StaticNavItemProps>(({ menu, onClick }) => {
  const navLinkClassName = useCallback(({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center space-x-3 w-full transition-all",
      isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
    ), []);

  const IconComponent = iconMap[menu.icon] || LayoutGrid;
  const translatedName = useMenuTranslation(menu.id, menu.name);

  return (
    <Button
      asChild
      variant="ghost"
      className="w-full justify-start px-3 py-2 text-sm font-medium rounded-md"
    >
      <NavLink
        to={menu.path}
        end={menu.path === '/'}
        onClick={onClick}
        className={navLinkClassName}
      >
        <IconComponent className="h-5 w-5" />
        <span>{translatedName}</span>
      </NavLink>
    </Button>
  );
});

StaticNavItem.displayName = 'StaticNavItem';

interface StaticNavigationProps {
  onClick?: () => void;
  className?: string;
}

/**
 * 静态导航主组件
 * 从后端获取菜单数据并渲染
 */
export const StaticNavigation = memo<StaticNavigationProps>(({ 
  onClick, 
  className 
}) => {
  const { user } = useAuth();
  const { t } = useI18n();

  // 获取用户权限和菜单数据（合并接口）
  const { data: userPermissions, isLoading, error } = useQuery({
    queryKey: ['userPermissions', user?.id],
    queryFn: () => getUserPermissions(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    gcTime: 10 * 60 * 1000, // 10分钟缓存
    select: (data) => data.data, // 提取data字段
  });

  // 获取菜单列表
  const allMenus = userPermissions?.menus || [];
  
  // 去重并按sort字段排序
  const visibleMenus = allMenus
    .filter((menu, index, self) => 
      menu.visible && self.findIndex(m => m.id === menu.id) === index
    )
    .sort((a, b) => a.sort - b.sort);

  // 加载中状态
  if (isLoading) {
    return (
      <nav className={cn("space-y-1", className)} role="navigation">
        <div className="px-3 py-2 text-sm text-muted-foreground">
          {t('common.loading')}
        </div>
      </nav>
    );
  }

  // 错误状态
  if (error) {
    return (
      <nav className={cn("space-y-1", className)} role="navigation">
        <div className="px-3 py-2 text-sm text-red-500">
          {t('common.loadFailed')}
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className={cn("space-y-1", className)} 
      role="navigation" 
      aria-label="主导航"
    >
      {visibleMenus.map((menu) => (
        <StaticNavItem
          key={menu.id}
          menu={menu}
          onClick={onClick}
        />
      ))}
    </nav>
  );
});

StaticNavigation.displayName = 'StaticNavigation';

/**
 * Hook：获取当前页面标题（根据路径匹配）
 */
export const usePageTitle = (currentPath: string): string => {
  const { user } = useAuth();
  const { t } = useI18n();
  
  const { data: userPermissions } = useQuery({
    queryKey: ['userPermissions', user?.id],
    queryFn: () => getUserPermissions(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    select: (data) => data.data,
  });

  const allMenus = userPermissions?.menus || [];
  const menu = allMenus.find(m => m.path === currentPath);
  
  // 获取翻译后的菜单名称
  const translatedName = menu ? useMenuTranslation(menu.id, menu.name) : t('common.pageLoadFailed');
  
  return translatedName;
};

/**
 * Hook：检查页面是否需要管理员权限
 */
export const useRequiresAdminAccess = (currentPath: string): boolean => {
  const { user } = useAuth();
  
  const { data: userPermissions } = useQuery({
    queryKey: ['userPermissions', user?.id],
    queryFn: () => getUserPermissions(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    select: (data) => data.data,
  });

  const allMenus = userPermissions?.menus || [];
  const menu = allMenus.find(m => m.path === currentPath);
  return menu?.requiresAdmin || false;
};