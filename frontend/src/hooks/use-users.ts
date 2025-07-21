import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  getUser,
  getUserProjects,
  assignUserToProject,
  unassignUserFromProject 
} from '@/lib/api/users';
import { CreateUserRequest, UpdateUserRequest } from '@/types/user';

// Get all users
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await getUsers();
      return response.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always'
  });
}

// Get specific user
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await getUser(userId);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always'
  });
}

// Get user projects
export function useUserProjects(userId: string) {
  return useQuery({
    queryKey: ['user-projects', userId],
    queryFn: async () => {
      const response = await getUserProjects(userId);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always'
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

// Assign user to project mutation
export function useAssignUserToProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, projectId }: { userId: string; projectId: string }) => 
      assignUserToProject(userId, projectId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-projects', variables.userId] });
    }
  });
}

// Unassign user from project mutation
export function useUnassignUserFromProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, projectId }: { userId: string; projectId: string }) => 
      unassignUserFromProject(userId, projectId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-projects', variables.userId] });
    }
  });
}