// 动态导航组件
// 根据gin-admin分析实现的动态菜单渲染

import React, { memo, useCallback, useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useDynamicMenus, getMenuIcon } from '@/hooks/use-dynamic-menus.tsx';
import { PermissionMenuItem } from '@/components/permissions/permission-guard';
import type { MenuTreeNode } from '@/types/menu';
import { useI18n } from '@/contexts/i18n-context';

interface DynamicNavItemProps {
  menu: MenuTreeNode;
  onClick?: () => void;
  depth?: number;
}

/**
 * 动态导航项组件
 */
const DynamicNavItem = memo<DynamicNavItemProps>(({ menu, onClick, depth = 0 }) => {

  const navLinkClassName = useCallback(({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center space-x-3 w-full transition-all",
      isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
      depth > 0 && "ml-4" // 子菜单缩进
    ), [depth]);

  // 如果没有路径，就是分组标题
  if (!menu.path) {
    return (
      <div className={cn("px-3 py-2 text-sm font-medium text-muted-foreground", depth > 0 && "ml-4")}>
        <div className="flex items-center space-x-3">
          {getMenuIcon(menu.icon)}
          <span>{menu.name}</span>
        </div>
      </div>
    );
  }

  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "w-full justify-start px-3 py-2 text-sm font-medium rounded-md",
        depth > 0 && "ml-4"
      )}
    >
      <NavLink
        to={menu.path}
        end={menu.path === '/'}
        onClick={onClick}
        className={navLinkClassName}
      >
        {getMenuIcon(menu.icon)}
        <span>{menu.name}</span>
      </NavLink>
    </Button>
  );
});

DynamicNavItem.displayName = 'DynamicNavItem';

interface DynamicCollapsibleGroupProps {
  menu: MenuTreeNode;
  onClick?: () => void;
  depth?: number;
}

/**
 * 动态可折叠菜单组
 */
const DynamicCollapsibleGroup = memo<DynamicCollapsibleGroupProps>(({ 
  menu, 
  onClick, 
  depth = 0 
}) => {
  const [isOpen, setIsOpen] = useState(() => {
    const storageKey = `sidebar-${menu.id}-expanded`;
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : false;
  });

  const toggleOpen = useCallback(() => {
    setIsOpen((prev: boolean) => {
      const newValue = !prev;
      const storageKey = `sidebar-${menu.id}-expanded`;
      localStorage.setItem(storageKey, JSON.stringify(newValue));
      return newValue;
    });
  }, [menu.id]);

  return (
    <div className={cn("space-y-1", depth > 0 && "ml-4")}>
      <Button
        variant="ghost"
        className="w-full justify-start px-3 py-2 text-sm font-medium rounded-md hover:text-foreground"
        onClick={toggleOpen}
      >
        <div className="flex items-center space-x-3 w-full">
          {getMenuIcon(menu.icon)}
          <span className="flex-1 text-left">{menu.name}</span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </Button>
      {isOpen && menu.children && (
        <div className="space-y-1">
          {menu.children.map((child) => (
            <DynamicMenuRenderer
              key={child.id}
              menu={child}
              onClick={onClick}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
});

DynamicCollapsibleGroup.displayName = 'DynamicCollapsibleGroup';

interface DynamicMenuRendererProps {
  menu: MenuTreeNode;
  onClick?: () => void;
  depth?: number;
}

/**
 * 动态菜单渲染器
 * 递归渲染菜单树结构
 */
const DynamicMenuRenderer = memo<DynamicMenuRendererProps>(({ 
  menu, 
  onClick, 
  depth = 0 
}) => {
  // 不显示隐藏的菜单
  if (!menu.visible) {
    return null;
  }

  // 构建权限键 - 用于权限检查
  const permissionKey = menu.path || menu.name.toLowerCase().replace(/\s+/g, '-');

  // 如果有子菜单，渲染为可折叠组
  if (menu.children && menu.children.length > 0) {
    return (
      <PermissionMenuItem permission={permissionKey} path={menu.path}>
        <DynamicCollapsibleGroup 
          menu={menu} 
          onClick={onClick} 
          depth={depth} 
        />
      </PermissionMenuItem>
    );
  }

  // 渲染单个菜单项
  return (
    <PermissionMenuItem permission={permissionKey} path={menu.path}>
      <DynamicNavItem 
        menu={menu} 
        onClick={onClick} 
        depth={depth} 
      />
    </PermissionMenuItem>
  );
});

DynamicMenuRenderer.displayName = 'DynamicMenuRenderer';

interface DynamicNavigationProps {
  onClick?: () => void;
  className?: string;
}

/**
 * 动态导航主组件
 * 替换硬编码的导航菜单
 */
export const DynamicNavigation = memo<DynamicNavigationProps>(({ 
  onClick, 
  className 
}) => {
  const { navigationItems, isLoading, error } = useDynamicMenus();
  const { t } = useI18n();

  // 按 sort 字段排序菜单
  const sortedMenus = useMemo(() => {
    return [...navigationItems].sort((a, b) => a.sort - b.sort);
  }, [navigationItems]);

  // 加载中状态
  if (isLoading) {
    return (
      <nav className={cn("space-y-1", className)} role="navigation">
        <div className="px-3 py-2 text-sm text-muted-foreground">
          {t('common.loading')}...
        </div>
      </nav>
    );
  }

  // 错误状态
  if (error) {
    return (
      <nav className={cn("space-y-1", className)} role="navigation">
        <div className="px-3 py-2 text-sm text-red-500">
          {error}
        </div>
      </nav>
    );
  }

  // 没有菜单
  if (!sortedMenus || sortedMenus.length === 0) {
    return (
      <nav className={cn("space-y-1", className)} role="navigation">
        <div className="px-3 py-2 text-sm text-muted-foreground">
          {t('nav.noMenus')}
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className={cn("space-y-1", className)} 
      role="navigation" 
      aria-label={t("nav.mainNavigation")}
    >
      {sortedMenus.map((menu) => (
        <DynamicMenuRenderer
          key={menu.id}
          menu={menu}
          onClick={onClick}
        />
      ))}
    </nav>
  );
});

DynamicNavigation.displayName = 'DynamicNavigation';

/**
 * 面包屑导航组件
 */
interface DynamicBreadcrumbsProps {
  currentPath: string;
  className?: string;
}

export const DynamicBreadcrumbs = memo<DynamicBreadcrumbsProps>(({ 
  currentPath, 
  className 
}) => {
  const { getBreadcrumbs } = useDynamicMenus();
  const breadcrumbs = getBreadcrumbs(currentPath);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className={cn("flex items-center space-x-2 text-sm", className)}>
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.id}>
          {index > 0 && <span className="text-muted-foreground">/</span>}
          <span 
            className={cn(
              index === breadcrumbs.length - 1 
                ? "text-foreground font-medium" 
                : "text-muted-foreground"
            )}
          >
            {crumb.name}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
});

DynamicBreadcrumbs.displayName = 'DynamicBreadcrumbs';

/**
 * 页面标题组件（根据当前菜单）
 */
interface DynamicPageTitleProps {
  currentPath: string;
  fallback?: string;
  className?: string;
}

export const DynamicPageTitle = memo<DynamicPageTitleProps>(({ 
  currentPath, 
  fallback, 
  className 
}) => {
  const { getCurrentMenu } = useDynamicMenus();
  const currentMenu = getCurrentMenu(currentPath);

  const title = currentMenu?.name || fallback || '页面';

  return (
    <h1 className={cn("text-2xl font-bold", className)}>
      {title}
    </h1>
  );
});

DynamicPageTitle.displayName = 'DynamicPageTitle';