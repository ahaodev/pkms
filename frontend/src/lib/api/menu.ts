// Menu API服务

import { apiClient } from './api';
import type { 
  Menu, 
  MenuTreeNode, 
  CreateMenuRequest, 
  UpdateMenuRequest,
  MenuAction,
  CreateMenuActionRequest 
} from '@/types/menu';

export const menuApi = {
  // 菜单管理
  getMenuTree: (): Promise<MenuTreeNode[]> =>
    apiClient.get('/api/v1/menu/tree').then(res => res.data.data),

  getUserMenuTree: (): Promise<MenuTreeNode[]> =>
    apiClient.get('/api/v1/menu/user-tree').then(res => res.data.data),

  createMenu: (data: CreateMenuRequest): Promise<Menu> =>
    apiClient.post('/api/v1/menu', data).then(res => res.data.data),

  getMenu: (id: string): Promise<Menu> =>
    apiClient.get(`/api/v1/menu/${id}`).then(res => res.data.data),

  updateMenu: (id: string, data: UpdateMenuRequest): Promise<Menu> =>
    apiClient.put(`/api/v1/menu/${id}`, data).then(res => res.data.data),

  deleteMenu: (id: string): Promise<void> =>
    apiClient.delete(`/api/v1/menu/${id}`).then(() => {}),

  // 菜单动作管理
  getMenuActions: (menuId: string): Promise<MenuAction[]> =>
    apiClient.get(`/api/v1/menu/${menuId}/actions`).then(res => res.data.data),

  createMenuAction: (menuId: string, data: CreateMenuActionRequest): Promise<MenuAction> =>
    apiClient.post(`/api/v1/menu/${menuId}/actions`, data).then(res => res.data.data),

  updateMenuAction: (actionId: string, data: CreateMenuActionRequest): Promise<MenuAction> =>
    apiClient.put(`/api/v1/menu/actions/${actionId}`, data).then(res => res.data.data),

  deleteMenuAction: (actionId: string): Promise<void> =>
    apiClient.delete(`/api/v1/menu/actions/${actionId}`).then(() => {}),

  // 权限检查
  checkPermission: (permissionKey: string): Promise<boolean> =>
    apiClient.get(`/api/v1/menu/check-permission?permission_key=${permissionKey}`).then(res => res.data.data),

  getUserPermissions: (): Promise<string[]> =>
    apiClient.get('/api/v1/menu/user-permissions').then(res => res.data.data),

  // 从Casbin获取按钮级权限
  getUserButtonPermissions: (): Promise<string[]> =>
    apiClient.get('/api/v1/casbin/user/button-permissions').then(res => res.data.data),

  // 获取侧边栏权限
  getSidebarPermissions: (): Promise<{ sidebar: string[] }> =>
    apiClient.get('/api/v1/casbin/sidebar/permissions').then(res => res.data.data),
};