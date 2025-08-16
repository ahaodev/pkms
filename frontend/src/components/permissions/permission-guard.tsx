// 权限守卫组件，用于按钮级权限控制

import React from 'react';
import { usePermissions } from '@/hooks/use-permissions.tsx';

interface PermissionGuardProps {
  /** 需要检查的权限键 */
  permission: string;
  /** 权限不足时的回退组件 */
  fallback?: React.ReactNode;
  /** 子组件 */
  children: React.ReactNode;
  /** 是否为管理员权限（管理员可以看到所有内容） */
  adminOverride?: boolean;
  /** 自定义权限检查函数 */
  customCheck?: () => boolean;
}

/**
 * 权限守卫组件
 * 根据用户权限控制子组件的显示
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  fallback = null,
  children,
  adminOverride = true,
  customCheck,
}) => {
  const { hasPermission, isAdmin, isLoading } = usePermissions();

  // 加载中时显示子组件（避免闪烁）
  if (isLoading) {
    return <>{children}</>;
  }

  // 自定义权限检查
  if (customCheck && !customCheck()) {
    return <>{fallback}</>;
  }

  // 管理员覆盖（管理员可以访问所有功能）
  if (adminOverride && isAdmin) {
    return <>{children}</>;
  }

  // 检查具体权限
  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  // 权限不足，显示回退组件
  return <>{fallback}</>;
};

/**
 * 权限按钮组件
 * 专门用于按钮的权限控制
 */
interface PermissionButtonProps {
  permission: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  permission,
  children,
  disabled = false,
  onClick,
  className,
  variant = 'default',
  size = 'default',
}) => {
  const { hasPermission, isAdmin } = usePermissions();

  // 检查权限
  const canAccess = isAdmin || hasPermission(permission);

  if (!canAccess) {
    return null; // 没有权限时不显示按钮
  }

  // 动态导入Button组件以避免循环依赖
  const Button = React.lazy(() => import('@/components/ui/button').then(module => ({ default: module.Button })));

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={onClick}
        className={className}
      >
        {children}
      </Button>
    </React.Suspense>
  );
};

/**
 * 菜单权限组件
 * 用于控制菜单项的显示
 */
interface PermissionMenuItemProps {
  permission: string;
  path?: string;
  children: React.ReactNode;
  exact?: boolean;
}

export const PermissionMenuItem: React.FC<PermissionMenuItemProps> = ({
  permission,
  path,
  children,
  exact = false,
}) => {
  const { hasPermission, isAdmin, hasMenuAccess } = usePermissions();

  // 检查菜单权限
  let canAccess = isAdmin || hasPermission(permission);
  
  // 如果有路径，也检查路径权限
  if (path && !canAccess) {
    canAccess = hasMenuAccess(path);
  }

  if (!canAccess) {
    return null;
  }

  return <>{children}</>;
};

/**
 * 多权限守卫组件
 * 支持多个权限的 AND/OR 逻辑
 */
interface MultiPermissionGuardProps {
  permissions: string[];
  mode: 'AND' | 'OR'; // AND: 需要所有权限, OR: 需要任一权限
  fallback?: React.ReactNode;
  children: React.ReactNode;
  adminOverride?: boolean;
}

export const MultiPermissionGuard: React.FC<MultiPermissionGuardProps> = ({
  permissions,
  mode,
  fallback = null,
  children,
  adminOverride = true,
}) => {
  const { hasPermission, isAdmin } = usePermissions();

  // 管理员覆盖
  if (adminOverride && isAdmin) {
    return <>{children}</>;
  }

  // 检查权限
  let hasAccess = false;
  if (mode === 'AND') {
    hasAccess = permissions.every(permission => hasPermission(permission));
  } else {
    hasAccess = permissions.some(permission => hasPermission(permission));
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};