// 角色管理Hook

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleApi } from '@/lib/api/role';
import { useAuth } from '@/providers/auth-provider';
import type { 
  Role, 
  CreateRoleRequest, 
  UpdateRoleRequest, 
  AssignRoleRequest 
} from '@/types/role';

/**
 * 角色列表Hook
 */
export const useRoles = () => {
  const { user } = useAuth();
  
  return useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: roleApi.getRoles,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    gcTime: 10 * 60 * 1000, // 10分钟缓存
  });
};

/**
 * 单个角色详情Hook
 */
export const useRole = (roleId: string) => {
  return useQuery({
    queryKey: ['role', roleId],
    queryFn: () => roleApi.getRole(roleId),
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * 用户的角色Hook
 */
export const useUserRoles = (userId?: string) => {
  return useQuery({
    queryKey: ['userRoles', userId],
    queryFn: () => userId ? roleApi.getUserRolesByUserId(userId) : roleApi.getUserRoles(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * 角色用户列表Hook
 */
export const useRoleUsers = (roleId: string) => {
  return useQuery({
    queryKey: ['roleUsers', roleId],
    queryFn: () => roleApi.getRoleUsers(roleId),
    enabled: !!roleId,
    staleTime: 2 * 60 * 1000, // 2分钟缓存，用户分配更新较频繁
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * 角色权限Hook
 */
export const useRolePermissions = (roleId: string) => {
  return useQuery({
    queryKey: ['rolePermissions', roleId],
    queryFn: () => roleApi.getRolePermissions(roleId),
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * 角色管理操作Hook
 */
export const useRoleOperations = () => {
  const queryClient = useQueryClient();

  // 创建角色
  const createRole = useMutation({
    mutationFn: (data: CreateRoleRequest) => roleApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  // 更新角色
  const updateRole = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) =>
      roleApi.updateRole(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['rolePermissions'] });
    },
  });

  // 删除角色
  const deleteRole = useMutation({
    mutationFn: (roleId: string) => roleApi.deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
    },
  });

  // 分配角色给用户
  const assignRoleToUsers = useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: AssignRoleRequest }) =>
      roleApi.assignRoleToUsers(roleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roleUsers', variables.roleId] });
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
    },
  });

  // 从用户移除角色
  const removeRoleFromUsers = useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: AssignRoleRequest }) =>
      roleApi.removeRoleFromUsers(roleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roleUsers', variables.roleId] });
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
    },
  });

  // 分配菜单给角色
  const assignMenusToRole = useMutation({
    mutationFn: ({ roleId, menuIds }: { roleId: string; menuIds: string[] }) =>
      roleApi.assignMenusToRole(roleId, menuIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rolePermissions', variables.roleId] });
      queryClient.invalidateQueries({ queryKey: ['userMenuTree'] });
      queryClient.invalidateQueries({ queryKey: ['userPermissions'] });
    },
  });

  return {
    createRole,
    updateRole,
    deleteRole,
    assignRoleToUsers,
    removeRoleFromUsers,
    assignMenusToRole,
  };
};

/**
 * 角色状态管理Hook
 */
export const useRoleManagement = () => {
  const { data: roles = [], isLoading: rolesLoading, error } = useRoles();
  const operations = useRoleOperations();


  return {
    // 数据
    roles,
    
    // 状态
    isLoading: rolesLoading,
    error,
    
    // 操作
    ...operations,
  };
};