import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userTenantRoleApi } from '@/lib/api/user-tenant-role';
import type {
  AssignUserTenantRoleRequest,
  RemoveUserTenantRoleRequest,
} from '@/types/user-tenant-role';

// 获取用户在特定租户中的角色
export function useUserRolesByTenant(userId: string, tenantId: string) {
  return useQuery({
    queryKey: ['user-tenant-roles', userId, tenantId],
    queryFn: () => userTenantRoleApi.getUserRolesByTenant(userId, tenantId),
    enabled: !!userId && !!tenantId,
  });
}

// 获取用户的所有租户角色关联
export function useAllUserTenantRoles(userId: string) {
  return useQuery({
    queryKey: ['user-tenant-roles', userId],
    queryFn: () => userTenantRoleApi.getAllUserTenantRoles(userId),
    enabled: !!userId,
  });
}

// 获取当前用户的租户角色关联
export function useCurrentUserTenantRoles() {
  return useQuery({
    queryKey: ['current-user-tenant-roles'],
    queryFn: () => userTenantRoleApi.getCurrentUserTenantRoles(),
  });
}

// 获取特定租户角色下的用户
export function useUsersByTenantRole(tenantId: string, roleId: string) {
  return useQuery({
    queryKey: ['tenant-role-users', tenantId, roleId],
    queryFn: () => userTenantRoleApi.getUsersByTenantRole(tenantId, roleId),
    enabled: !!tenantId && !!roleId,
  });
}

// 分配用户租户角色
export function useAssignUserTenantRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AssignUserTenantRoleRequest) =>
      userTenantRoleApi.assignUserTenantRoles(request),
    onSuccess: (_, variables) => {
      // 刷新相关查询
      queryClient.invalidateQueries({ queryKey: ['user-tenant-roles', variables.user_id] });
      queryClient.invalidateQueries({ queryKey: ['current-user-tenant-roles'] });
      
      // 刷新每个涉及的租户的查询
      variables.tenant_roles.forEach(({ tenant_id, role_id }) => {
        queryClient.invalidateQueries({
          queryKey: ['user-tenant-roles', variables.user_id, tenant_id]
        });
        queryClient.invalidateQueries({
          queryKey: ['tenant-role-users', tenant_id, role_id]
        });
      });
    },
  });
}

// 移除用户租户角色
export function useRemoveUserTenantRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RemoveUserTenantRoleRequest) =>
      userTenantRoleApi.removeUserTenantRole(request),
    onSuccess: (_, variables) => {
      // 刷新相关查询
      queryClient.invalidateQueries({ queryKey: ['user-tenant-roles', variables.user_id] });
      queryClient.invalidateQueries({
        queryKey: ['user-tenant-roles', variables.user_id, variables.tenant_id]
      });
      queryClient.invalidateQueries({
        queryKey: ['tenant-role-users', variables.tenant_id, variables.role_id]
      });
      queryClient.invalidateQueries({ queryKey: ['current-user-tenant-roles'] });
    },
  });
}

// 批量移除用户在租户中的所有角色
export function useRemoveAllUserRolesInTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, tenantId }: { userId: string; tenantId: string }) =>
      userTenantRoleApi.removeAllUserRolesInTenant(userId, tenantId),
    onSuccess: (_, variables) => {
      // 刷新相关查询
      queryClient.invalidateQueries({ queryKey: ['user-tenant-roles', variables.userId] });
      queryClient.invalidateQueries({
        queryKey: ['user-tenant-roles', variables.userId, variables.tenantId]
      });
      queryClient.invalidateQueries({ queryKey: ['current-user-tenant-roles'] });
      
      // 刷新该租户下所有角色的用户查询
      queryClient.invalidateQueries({
        predicate: (query) => {
          const [key, tenantId] = query.queryKey;
          return key === 'tenant-role-users' && tenantId === variables.tenantId;
        },
      });
    },
  });
}