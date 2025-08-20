import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getUsers, 
  getAllUsers,
  createUser, 
  updateUser, 
  deleteUser, 
  getUser,
  getUserProjects,
  assignUserToProject,
  unassignUserFromProject 
} from '@/lib/api/users';
import { CreateUserRequest, UpdateUserRequest } from '@/types/user';

// Get all users (for backwards compatibility, uses large page size)
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await getAllUsers();
      return response.data;
    },
    enabled: !!localStorage.getItem('ACCESS_TOKEN'),
    staleTime: 2 * 60 * 1000, // 2分钟缓存
    gcTime: 5 * 60 * 1000, // 5分钟垃圾回收
    refetchOnMount: false // 不要每次mount都刷新
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
    enabled: !!localStorage.getItem('ACCESS_TOKEN'),
    staleTime: 2 * 60 * 1000, // 2分钟缓存
    gcTime: 5 * 60 * 1000, // 5分钟垃圾回收
    refetchOnMount: false // 不要每次mount都刷新
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
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    gcTime: 10 * 60 * 1000, // 10分钟垃圾回收
    refetchOnMount: false
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
    staleTime: 3 * 60 * 1000, // 3分钟缓存
    gcTime: 7 * 60 * 1000, // 7分钟垃圾回收
    refetchOnMount: false
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