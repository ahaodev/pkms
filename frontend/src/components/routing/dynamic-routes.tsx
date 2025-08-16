// 动态路由组件
// 根据gin-admin分析实现的动态路由配置

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDynamicMenus } from '@/hooks/use-dynamic-menus.tsx';
import { PermissionGuard } from '@/components/permissions/permission-guard';
import { Skeleton } from '@/components/ui/skeleton';
import type { MenuTreeNode } from '@/types/menu';

// 页面组件映射 - 将数据库中的component字段映射到实际的组件
const componentMap: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  // 主要页面
  'Dashboard': lazy(() => import('@/pages/dashboard')),
  'HierarchyPage': lazy(() => import('@/pages/hierarchy')),
  'UpgradePage': lazy(() => import('@/pages/upgrade')),
  'ClientAccessPage': lazy(() => import('@/pages/client-access')),
  'SharesManagerPage': lazy(() => import('@/pages/shares-manager')),
  
  // 系统管理页面
  'TenantsPage': lazy(() => import('@/pages/tenants')),
  'UsersPage': lazy(() => import('@/pages/users')),
  
  // 新增的RBAC管理页面
  'MenuManagement': lazy(() => import('@/pages/menu-management')),
  'RoleManagement': lazy(() => import('@/pages/role-management')),
};

// 默认页面组件（当没有找到对应组件时使用）
const DefaultPage = lazy(() => Promise.resolve({ 
  default: () => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">页面开发中</h2>
        <p className="text-muted-foreground">该功能正在开发中，敬请期待...</p>
      </div>
    </div>
  )
}));

// 加载组件
const LoadingComponent = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-32 w-full" />
  </div>
);

// 错误边界组件
class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Route error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-red-600">页面加载失败</h2>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || '未知错误'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface DynamicRouteProps {
  menu: MenuTreeNode;
}

/**
 * 动态路由项组件
 */
const DynamicRoute: React.FC<DynamicRouteProps> = ({ menu }) => {
  // 如果没有路径，跳过渲染
  if (!menu.path) {
    return null;
  }

  // 获取对应的组件
  const Component = menu.component ? componentMap[menu.component] : DefaultPage;
  
  // 如果没有找到组件，使用默认页面
  const FinalComponent = Component || DefaultPage;

  // 构建权限键
  const permissionKey = menu.path.replace('/', '') || 'dashboard';

  return (
    <Route
      key={menu.id}
      path={menu.path}
      element={
        <PermissionGuard 
          permission={permissionKey}
          fallback={
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">访问被拒绝</h2>
                <p className="text-muted-foreground">您没有权限访问此页面</p>
              </div>
            </div>
          }
        >
          <RouteErrorBoundary>
            <Suspense fallback={<LoadingComponent />}>
              <FinalComponent />
            </Suspense>
          </RouteErrorBoundary>
        </PermissionGuard>
      }
    />
  );
};

/**
 * 递归渲染菜单路由
 */
const renderMenuRoutes = (menus: MenuTreeNode[]): React.ReactElement[] => {
  const routes: React.ReactElement[] = [];

  for (const menu of menus) {
    // 渲染当前菜单路由
    if (menu.path && menu.visible) {
      routes.push(<DynamicRoute key={menu.id} menu={menu} />);
    }

    // 递归渲染子菜单路由
    if (menu.children && menu.children.length > 0) {
      routes.push(...renderMenuRoutes(menu.children));
    }
  }

  return routes;
};

/**
 * 动态路由主组件
 */
export const DynamicRoutes: React.FC = () => {
  const { flatMenus, isLoading, error } = useDynamicMenus();

  // 加载中
  if (isLoading) {
    return <LoadingComponent />;
  }

  // 错误状态
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-red-600">路由加载失败</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* 公共路由 - 登录页面 */}
      <Route
        path="/login"
        element={
          <Suspense fallback={<LoadingComponent />}>
            {React.createElement(lazy(() => import('@/pages/login')))}
          </Suspense>
        }
      />

      {/* 动态路由 */}
      {flatMenus.map(menu => (
        <DynamicRoute key={menu.id} menu={menu} />
      ))}

      {/* 默认重定向到首页 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * 静态路由（后备方案）
 * 当动态路由系统出现问题时使用
 */
export const StaticRoutes: React.FC = () => {
  // 直接导入页面组件
  const Dashboard = lazy(() => import('@/pages/dashboard'));
  const LoginPage = lazy(() => import('@/pages/login'));
  const HierarchyPage = lazy(() => import('@/pages/hierarchy'));
  const UsersPage = lazy(() => import('@/pages/users'));
  const UpgradePage = lazy(() => import('@/pages/upgrade'));
  const TenantsPage = lazy(() => import('@/pages/tenants'));
  const ClientAccessPage = lazy(() => import('@/pages/client-access'));
  const SharesManagerPage = lazy(() => import('@/pages/shares-manager'));

  return (
    <Routes>
      {/* 公共路由 */}
      <Route
        path="/login"
        element={
          <Suspense fallback={<LoadingComponent />}>
            <LoginPage />
          </Suspense>
        }
      />

      {/* 主要页面 */}
      <Route
        path="/"
        element={
          <PermissionGuard permission="dashboard">
            <Suspense fallback={<LoadingComponent />}>
              <Dashboard />
            </Suspense>
          </PermissionGuard>
        }
      />

      <Route
        path="/hierarchy"
        element={
          <PermissionGuard permission="projects">
            <Suspense fallback={<LoadingComponent />}>
              <HierarchyPage />
            </Suspense>
          </PermissionGuard>
        }
      />

      <Route
        path="/upgrade"
        element={
          <PermissionGuard permission="upgrade">
            <Suspense fallback={<LoadingComponent />}>
              <UpgradePage />
            </Suspense>
          </PermissionGuard>
        }
      />

      <Route
        path="/access-manager"
        element={
          <PermissionGuard permission="access-manager">
            <Suspense fallback={<LoadingComponent />}>
              <ClientAccessPage />
            </Suspense>
          </PermissionGuard>
        }
      />

      <Route
        path="/shares"
        element={
          <PermissionGuard permission="shares">
            <Suspense fallback={<LoadingComponent />}>
              <SharesManagerPage />
            </Suspense>
          </PermissionGuard>
        }
      />

      {/* 管理员页面 */}
      <Route
        path="/users"
        element={
          <PermissionGuard permission="system" adminOverride={true}>
            <Suspense fallback={<LoadingComponent />}>
              <UsersPage />
            </Suspense>
          </PermissionGuard>
        }
      />


      <Route
        path="/tenants"
        element={
          <PermissionGuard permission="system" adminOverride={true}>
            <Suspense fallback={<LoadingComponent />}>
              <TenantsPage />
            </Suspense>
          </PermissionGuard>
        }
      />

      {/* 默认重定向 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};