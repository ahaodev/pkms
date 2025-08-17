// 静态菜单API服务
// 从后端获取静态菜单配置和权限信息

import { apiClient } from './api';

// 菜单项类型定义
export interface StaticMenuItem {
  id: string;
  name: string;
  path: string;
  icon: string;
  visible: boolean;
  requiresAuth: boolean;
  requiresAdmin: boolean;
  sort: number;
}

// 用户菜单权限响应
export interface UserMenuPermissions {
  menus: StaticMenuItem[];
  permissions: string[];
}

export const staticMenuApi = {
  // 获取用户可访问的菜单列表
  getUserMenus: (): Promise<StaticMenuItem[]> =>
    apiClient.get('/api/v1/static-menu/user-menus').then(res => res.data.data),

  // 获取管理员菜单列表
  getAdminMenus: (): Promise<StaticMenuItem[]> =>
    apiClient.get('/api/v1/static-menu/admin-menus').then(res => res.data.data),

  // 获取所有菜单（管理员专用）
  getAllMenus: (): Promise<StaticMenuItem[]> =>
    apiClient.get('/api/v1/static-menu/all-menus').then(res => res.data.data),

  // 获取用户菜单权限（包括菜单和按钮权限）
  getUserMenuPermissions: (): Promise<UserMenuPermissions> =>
    apiClient.get('/api/v1/static-menu/user-permissions').then(res => res.data.data),

  // 检查用户是否有特定菜单访问权限
  checkMenuAccess: (menuPath: string): Promise<boolean> =>
    apiClient.get(`/api/v1/static-menu/check-access?path=${encodeURIComponent(menuPath)}`).then(res => res.data.data),

  // 获取侧边栏权限
  getSidebarPermissions: (): Promise<{ sidebar: string[] }> =>
    apiClient.get('/api/v1/casbin/sidebar/permissions').then(res => res.data.data),

  // 获取用户按钮权限
  getUserButtonPermissions: (): Promise<string[]> =>
    apiClient.get('/api/v1/casbin/user/button-permissions').then(res => res.data.data),
};