import { apiClient } from './api';
import type {
  UserTenantRole,
  AssignUserTenantRoleRequest,
  RemoveUserTenantRoleRequest,
} from '@/types/user-tenant-role';
import type { Role } from '@/types/role';
import type { User } from '@/types/user';

export const userTenantRoleApi = {
  // 分配用户租户角色
  assignUserTenantRoles: (request: AssignUserTenantRoleRequest): Promise<{ message: string }> =>
    apiClient.post('/api/v1/user-tenant-role/assign', request).then(res => res.data),

  // 移除用户租户角色
  removeUserTenantRole: (request: RemoveUserTenantRoleRequest): Promise<{ message: string }> =>
    apiClient.post('/api/v1/user-tenant-role/remove', request).then(res => res.data),

  // 获取用户在特定租户中的角色
  getUserRolesByTenant: (userId: string, tenantId: string): Promise<Role[]> =>
    apiClient.get(`/api/v1/user-tenant-role/user/${userId}/tenant/${tenantId}/roles`).then(res => res.data),

  // 获取用户的所有租户角色关联
  getAllUserTenantRoles: (userId: string): Promise<UserTenantRole[]> =>
    apiClient.get(`/api/v1/user-tenant-role/user/${userId}`).then(res => res.data),

  // 获取当前用户的租户角色关联
  getCurrentUserTenantRoles: (): Promise<UserTenantRole[]> =>
    apiClient.get('/api/v1/user-tenant-role/current').then(res => res.data),

  // 获取特定租户角色下的用户
  getUsersByTenantRole: (tenantId: string, roleId: string): Promise<User[]> =>
    apiClient.get(`/api/v1/user-tenant-role/tenant/${tenantId}/role/${roleId}/users`).then(res => res.data),

  // 批量移除用户在租户中的所有角色
  removeAllUserRolesInTenant: (userId: string, tenantId: string): Promise<{ message: string }> =>
    apiClient.delete(`/api/v1/user-tenant-role/user/${userId}/tenant/${tenantId}`).then(res => res.data),
};