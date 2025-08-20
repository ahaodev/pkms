import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientAccessApi } from '@/lib/api/access-manager.ts';
import type { 
  CreateClientAccessRequest, 
  UpdateClientAccessRequest,
  ClientAccessFilters 
} from '@/types/client-access';
import { toast } from 'sonner';

// 查询key常量
const CLIENT_ACCESS_KEYS = {
  all: ['client-access'] as const,
  lists: () => [...CLIENT_ACCESS_KEYS.all, 'list'] as const,
  list: (filters?: ClientAccessFilters) => [...CLIENT_ACCESS_KEYS.lists(), filters] as const,
  details: () => [...CLIENT_ACCESS_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CLIENT_ACCESS_KEYS.details(), id] as const,
};

// 获取客户端接入列表 (服务器端分页)
export function useClientAccessListWithPagination(
  filters?: ClientAccessFilters, 
  page: number = 1, 
  pageSize: number = 20
) {
  return useQuery({
    queryKey: [...CLIENT_ACCESS_KEYS.list(filters), 'paginated', page, pageSize],
    queryFn: () => clientAccessApi.getList(filters, page, pageSize),
  });
}

// 创建客户端接入
export function useCreateClientAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientAccessRequest) => clientAccessApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_ACCESS_KEYS.lists() });
      toast.success("设备接入凭证已创建");
    },
    onError: (error: Error) => {
      toast.error((error as any).response?.data?.message || "创建失败，请稍后重试");
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
      toast.success("设备接入凭证已更新");
    },
    onError: (error: Error) => {
      toast.error((error as any).response?.data?.message || "更新失败，请稍后重试");
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
      toast.success("设备接入凭证已删除");
    },
    onError: (error: Error) => {
      toast.error((error as any).response?.data?.message || "删除失败，请稍后重试");
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
      toast.success("令牌已重新生成，请及时更新客户端配置");
    },
    onError: (error: Error) => {
      toast.error((error as any).response?.data?.message || "重新生成失败，请稍后重试");
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
      toast.success(`设备接入凭证已${isActive ? "启用" : "禁用"}`);
    },
    onError: (error: Error) => {
      toast.error((error as any).response?.data?.message || "操作失败，请稍后重试");
    },
  });
}