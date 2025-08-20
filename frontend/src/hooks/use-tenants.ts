import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getTenants,
  getAllTenants,
  createTenant, 
  updateTenant, 
  deleteTenant, 
  getTenant,
  getTenantUsers,
  addUserToTenant,
  removeUserFromTenant,
  getTenantUsersWithRole,
  addUserToTenantWithRole,
  updateTenantUserRole
} from '@/lib/api/tenants';
import { CreateTenantRequest, UpdateTenantRequest } from '@/types/tenant';

// Get all tenants (for backwards compatibility, uses large page size)
export function useTenants() {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const response = await getAllTenants();
      return response.data;
    },
    enabled: !!localStorage.getItem('ACCESS_TOKEN'),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false
  });
}

// Get tenants with server-side pagination
export function useTenantsWithPagination(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ['tenants', 'paginated', page, pageSize],
    queryFn: async () => {
      const response = await getTenants(page, pageSize);
      // Backend now returns PagedResult wrapped in Response
      return response.data;
    },
    enabled: !!localStorage.getItem('ACCESS_TOKEN'),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false
  });
}

// Get specific tenant
export function useTenant(tenantId: string) {
  return useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
      const response = await getTenant(tenantId);
      return response.data;
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false
  });
}

// Get tenant users
export function useTenantUsers(tenantId: string) {
  return useQuery({
    queryKey: ['tenant-users', tenantId],
    queryFn: async () => {
      const response = await getTenantUsers(tenantId);
      return response.data;
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false
  });
}

// Create tenant mutation
export function useCreateTenant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (tenantData: CreateTenantRequest) => createTenant(tenantData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    }
  });
}

// Update tenant mutation
export function useUpdateTenant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, update }: { id: string; update: UpdateTenantRequest }) => 
      updateTenant(id, update),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', variables.id] });
    }
  });
}

// Delete tenant mutation
export function useDeleteTenant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (tenantId: string) => deleteTenant(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    }
  });
}

// Add user to tenant mutation
export function useAddUserToTenant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ tenantId, userId }: { tenantId: string; userId: string }) => 
      addUserToTenant(tenantId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenant-users', variables.tenantId] });
    }
  });
}

// Remove user from tenant mutation
export function useRemoveUserFromTenant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ tenantId, userId }: { tenantId: string; userId: string }) => 
      removeUserFromTenant(tenantId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenant-users', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-users-with-roles', variables.tenantId] });
    }
  });
}

// Get tenant users with roles
export function useTenantUsersWithRole(tenantId: string) {
  return useQuery({
    queryKey: ['tenant-users-with-roles', tenantId],
    queryFn: async () => {
      const response = await getTenantUsersWithRole(tenantId);
      return response.data;
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false
  });
}

// Add user to tenant with role mutation
export function useAddUserToTenantWithRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ tenantId, userId, role }: { tenantId: string; userId: string; role: string }) => 
      addUserToTenantWithRole(tenantId, userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenant-users', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-users-with-roles', variables.tenantId] });
    }
  });
}

// Update tenant user role mutation
export function useUpdateTenantUserRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ tenantId, userId, role, isActive }: { tenantId: string; userId: string; role: string; isActive?: boolean }) => 
      updateTenantUserRole(tenantId, userId, role, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenant-users', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-users-with-roles', variables.tenantId] });
    }
  });
}