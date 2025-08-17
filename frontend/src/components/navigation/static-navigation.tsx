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
import { staticMenuApi, type StaticMenuItem } from '@/lib/api/static-menu';

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
  menu: StaticMenuItem;
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
        <span>{menu.name}</span>
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
  const { user, isAdmin } = useAuth();

  // 获取用户菜单数据
  const { data: userMenus = [], isLoading, error } = useQuery({
    queryKey: ['userMenus', user?.id],
    queryFn: staticMenuApi.getUserMenus,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    gcTime: 10 * 60 * 1000, // 10分钟缓存
  });

  // 获取管理员菜单（如果是管理员）
  const { data: adminMenus = [] } = useQuery({
    queryKey: ['adminMenus'],
    queryFn: staticMenuApi.getAdminMenus,
    enabled: !!user && isAdmin(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // 合并用户菜单和管理员菜单
  const allMenus = isAdmin() ? [...userMenus, ...adminMenus] : userMenus;
  
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
          加载中...
        </div>
      </nav>
    );
  }

  // 错误状态
  if (error) {
    return (
      <nav className={cn("space-y-1", className)} role="navigation">
        <div className="px-3 py-2 text-sm text-red-500">
          菜单加载失败
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
  const { user, isAdmin } = useAuth();
  
  const { data: userMenus = [] } = useQuery({
    queryKey: ['userMenus', user?.id],
    queryFn: staticMenuApi.getUserMenus,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: adminMenus = [] } = useQuery({
    queryKey: ['adminMenus'],
    queryFn: staticMenuApi.getAdminMenus,
    enabled: !!user && isAdmin(),
    staleTime: 5 * 60 * 1000,
  });

  const allMenus = isAdmin() ? [...userMenus, ...adminMenus] : userMenus;
  const menu = allMenus.find(m => m.path === currentPath);
  
  return menu?.name || '页面';
};

/**
 * Hook：检查页面是否需要管理员权限
 */
export const useRequiresAdminAccess = (currentPath: string): boolean => {
  const { user, isAdmin } = useAuth();
  
  const { data: adminMenus = [] } = useQuery({
    queryKey: ['adminMenus'],
    queryFn: staticMenuApi.getAdminMenus,
    enabled: !!user && isAdmin(),
    staleTime: 5 * 60 * 1000,
  });

  const menu = adminMenus.find(m => m.path === currentPath);
  return menu?.requiresAdmin || false;
};