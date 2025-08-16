// Role API服务

import { apiClient } from './api';
import type { 
  Role, 
  CreateRoleRequest, 
  UpdateRoleRequest,
  AssignRoleRequest,
  RolePermission 
} from '@/types/role';

export const roleApi = {
  // 角色管理
  getRoles: (): Promise<Role[]> =>
    apiClient.get('/api/v1/role').then(res => res.data.data),

  createRole: (data: CreateRoleRequest): Promise<Role> =>
    apiClient.post('/api/v1/role', data).then(res => res.data.data),

  getRole: (id: string): Promise<Role> =>
    apiClient.get(`/api/v1/role/${id}`).then(res => res.data.data),

  updateRole: (id: string, data: UpdateRoleRequest): Promise<Role> =>
    apiClient.put(`/api/v1/role/${id}`, data).then(res => res.data.data),

  deleteRole: (id: string): Promise<void> =>
    apiClient.delete(`/api/v1/role/${id}`).then(() => {}),

  // 用户角色管理
  assignRoleToUsers: (roleId: string, data: AssignRoleRequest): Promise<void> =>
    apiClient.post(`/api/v1/role/${roleId}/assign`, data).then(() => {}),

  removeRoleFromUsers: (roleId: string, data: AssignRoleRequest): Promise<void> =>
    apiClient.post(`/api/v1/role/${roleId}/remove`, data).then(() => {}),

  getRoleUsers: (roleId: string): Promise<any[]> =>
    apiClient.get(`/api/v1/role/${roleId}/users`).then(res => res.data.data),

  // 用户角色查询
  getUserRoles: (): Promise<Role[]> =>
    apiClient.get('/api/v1/role/user').then(res => res.data.data),

  getUserRolesByUserId: (userId: string): Promise<Role[]> =>
    apiClient.get(`/api/v1/role/user/${userId}`).then(res => res.data.data),

  // 角色权限管理
  assignMenusToRole: (roleId: string, menuIds: string[]): Promise<void> =>
    apiClient.post(`/api/v1/role/${roleId}/menus`, menuIds).then(() => {}),

  getRolePermissions: (roleId: string): Promise<RolePermission[]> =>
    apiClient.get(`/api/v1/role/${roleId}/permissions`).then(res => res.data.data),
};