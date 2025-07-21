import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getTenants, 
  createTenant, 
  updateTenant, 
  deleteTenant, 
  getTenant,
  getTenantUsers,
  addUserToTenant,
  removeUserFromTenant
} from '@/lib/api/tenants';
import { CreateTenantRequest, UpdateTenantRequest } from '@/types/tenant';

// Get all tenants
export function useTenants() {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const response = await getTenants();
      return response.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always'
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
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always'
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
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always'
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
    }
  });
}