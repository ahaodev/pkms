// use-releases.ts
// Release 相关数据的自定义 hooks，基于 react-query 实现，所有数据均通过 serviceFactory 获取
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {serviceFactory} from '@/services/service-factory';
import {Release, ReleaseFilters} from '@/types';

const releaseService = serviceFactory.getReleaseService();

// Query keys
export const releaseKeys = {
    all: ['releases'] as const,
    lists: () => [...releaseKeys.all, 'list'] as const,
    list: (filters?: ReleaseFilters) => [...releaseKeys.lists(), filters] as const,
    details: () => [...releaseKeys.all, 'detail'] as const,
    detail: (id: string) => [...releaseKeys.details(), id] as const,
};

// 获取 Release 列表
export const useReleases = (filters?: ReleaseFilters) => {
    return useQuery({
        queryKey: releaseKeys.list(filters),
        queryFn: () => releaseService.getReleases(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// 获取单个 Release 详情
export const useRelease = (id: string) => {
    return useQuery({
        queryKey: releaseKeys.detail(id),
        queryFn: () => releaseService.getRelease(id),
        enabled: !!id,
    });
};

// 创建 Release
export const useCreateRelease = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (release: Omit<Release, 'id' | 'createdAt'>) =>
            releaseService.createRelease(release),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: releaseKeys.lists()});
        },
    });
};

// 更新 Release
export const useUpdateRelease = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, data}: { id: string; data: Partial<Release> }) =>
            releaseService.updateRelease(id, data),
        onSuccess: (_, {id}) => {
            queryClient.invalidateQueries({queryKey: releaseKeys.detail(id)});
            queryClient.invalidateQueries({queryKey: releaseKeys.lists()});
        },
    });
};

// 删除 Release
export const useDeleteRelease = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => releaseService.deleteRelease(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: releaseKeys.lists()});
        },
    });
};

// Promote Release
export const usePromoteRelease = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, environment}: { id: string; environment: Release['environment'] }) =>
            releaseService.promoteRelease(id, environment),
        onSuccess: (_, {id}) => {
            queryClient.invalidateQueries({queryKey: releaseKeys.detail(id)});
            queryClient.invalidateQueries({queryKey: releaseKeys.lists()});
        },
    });
};

// 审批 Release
export const useApproveRelease = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => releaseService.approveRelease(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({queryKey: releaseKeys.detail(id)});
            queryClient.invalidateQueries({queryKey: releaseKeys.lists()});
        },
    });
};

// 拒绝 Release
export const useRejectRelease = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, reason}: { id: string; reason: string }) =>
            releaseService.rejectRelease(id, reason),
        onSuccess: (_, {id}) => {
            queryClient.invalidateQueries({queryKey: releaseKeys.detail(id)});
            queryClient.invalidateQueries({queryKey: releaseKeys.lists()});
        },
    });
};
