import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {createUser, deleteUser, getUsers, updateUser} from '@/lib/api/users';
import {CreateUserRequest, UpdateUserRequest} from '@/types/user';
import {ACCESS_TOKEN} from "@/types/constants.ts";

// Get all users (for backwards compatibility, uses large page size)
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await getUsers(1,1000 );
      return response.data;
    },
    enabled: !!localStorage.getItem(ACCESS_TOKEN),
  });
}

// Get users with server-side pagination
export function useUsersWithPagination(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ['users', 'paginated', page, pageSize],
    queryFn: async () => {
      const response = await getUsers(page, pageSize);
      // Backend now returns PagedResult wrapped in Response
      return response.data;
    },
    enabled: !!localStorage.getItem(ACCESS_TOKEN),
  });
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: CreateUserRequest) => createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, update }: { id: string; update: UpdateUserRequest }) => 
      updateUser(id, update),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    }
  });
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
}