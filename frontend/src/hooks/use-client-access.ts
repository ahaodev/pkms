import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientAccessApi } from '@/lib/api/client-access';
import type { 
  CreateClientAccessRequest, 
  UpdateClientAccessRequest,
  ClientAccessFilters 
} from '@/types/client-access';
import { toast } from '@/hooks/use-toast';

// 查询key常量
const CLIENT_ACCESS_KEYS = {
  all: ['client-access'] as const,
  lists: () => [...CLIENT_ACCESS_KEYS.all, 'list'] as const,
  list: (filters?: ClientAccessFilters) => [...CLIENT_ACCESS_KEYS.lists(), filters] as const,
  details: () => [...CLIENT_ACCESS_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CLIENT_ACCESS_KEYS.details(), id] as const,
};

// 获取客户端接入列表
export function useClientAccessList(filters?: ClientAccessFilters) {
  return useQuery({
    queryKey: CLIENT_ACCESS_KEYS.list(filters),
    queryFn: () => clientAccessApi.getList(filters),
    staleTime: 2 * 60 * 1000, // 2分钟
    gcTime: 5 * 60 * 1000, // 5分钟
  });
}

// 获取单个客户端接入详情
export function useClientAccess(id: string) {
  return useQuery({
    queryKey: CLIENT_ACCESS_KEYS.detail(id),
    queryFn: () => clientAccessApi.getById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// 创建客户端接入
export function useCreateClientAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientAccessRequest) => clientAccessApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_ACCESS_KEYS.lists() });
      toast({
        title: "创建成功",
        description: "设备接入凭证已创建",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "创建失败",
        description: (error as any).response?.data?.message || "请稍后重试",
        variant: "destructive",
      });
    },
  });
}

// 更新客户端接入
export function useUpdateClientAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientAccessRequest }) =>
      clientAccessApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CLIENT_ACCESS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CLIENT_ACCESS_KEYS.detail(id) });
      toast({
        title: "更新成功",
        description: "设备接入凭证已更新",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "更新失败",
        description: (error as any).response?.data?.message || "请稍后重试",
        variant: "destructive",
      });
    },
  });
}

// 删除客户端接入
export function useDeleteClientAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientAccessApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_ACCESS_KEYS.lists() });
      toast({
        title: "删除成功",
        description: "设备接入凭证已删除",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "删除失败",
        description: (error as any).response?.data?.message || "请稍后重试",
        variant: "destructive",
      });
    },
  });
}

// 重新生成令牌
export function useRegenerateToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientAccessApi.regenerateToken(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: CLIENT_ACCESS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CLIENT_ACCESS_KEYS.detail(id) });
      toast({
        title: "令牌已重新生成",
        description: "请及时更新客户端配置",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "重新生成失败",
        description: (error as any).response?.data?.message || "请稍后重试",
        variant: "destructive",
      });
    },
  });
}

// 切换状态
export function useToggleClientAccessStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      clientAccessApi.toggleStatus(id, isActive),
    onSuccess: (_, { id, isActive }) => {
      queryClient.invalidateQueries({ queryKey: CLIENT_ACCESS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CLIENT_ACCESS_KEYS.detail(id) });
      toast({
        title: isActive ? "已启用" : "已禁用",
        description: `设备接入凭证已${isActive ? "启用" : "禁用"}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "操作失败",
        description: (error as any).response?.data?.message || "请稍后重试",
        variant: "destructive",
      });
    },
  });
}