// use-deployments.ts
// 部署相关数据的自定义 hooks，基于 react-query 实现，所有数据均通过 serviceFactory 获取
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {serviceFactory} from '@/services/service-factory';
import {Deployment, DeploymentFilters} from '@/types';

const deploymentService = serviceFactory.getDeploymentService();

// Query keys
export const deploymentKeys = {
    all: ['deployments'] as const,
    lists: () => [...deploymentKeys.all, 'list'] as const,
    list: (filters?: DeploymentFilters) => [...deploymentKeys.lists(), filters] as const,
    details: () => [...deploymentKeys.all, 'detail'] as const,
    detail: (id: string) => [...deploymentKeys.details(), id] as const,
    logs: (id: string) => [...deploymentKeys.detail(id), 'logs'] as const,
    status: (id: string) => [...deploymentKeys.detail(id), 'status'] as const,
};

// 获取部署列表
export const useDeployments = (filters?: DeploymentFilters) => {
    return useQuery({
        queryKey: deploymentKeys.list(filters),
        queryFn: () => deploymentService.getDeployments(filters),
        staleTime: 30 * 1000, // 30 seconds (deployments change frequently)
    });
};

// 获取单个部署详情
export const useDeployment = (id: string) => {
    return useQuery({
        queryKey: deploymentKeys.detail(id),
        queryFn: () => deploymentService.getDeployment(id),
        enabled: !!id,
    });
};

// 获取部署日志
export const useDeploymentLogs = (id: string) => {
    return useQuery({
        queryKey: deploymentKeys.logs(id),
        queryFn: () => deploymentService.getDeploymentLogs(id),
        enabled: !!id,
        refetchInterval: 5000, // Refetch every 5 seconds for real-time logs
    });
};

// 获取部署状态
export const useDeploymentStatus = (id: string) => {
    return useQuery({
        queryKey: deploymentKeys.status(id),
        queryFn: () => deploymentService.getDeploymentStatus(id),
        enabled: !!id,
        refetchInterval: 2000, // Refetch every 2 seconds for real-time status
    });
};

// 创建部署
export const useCreateDeployment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (deployment: Omit<Deployment, 'id' | 'startTime' | 'steps' | 'status'>) =>
            deploymentService.createDeployment(deployment),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: deploymentKeys.lists()});
        },
    });
};

// 触发部署
export const useTriggerDeployment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({releaseId, environment}: { releaseId: string; environment: Deployment['environment'] }) =>
            deploymentService.triggerDeployment(releaseId, environment),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: deploymentKeys.lists()});
        },
    });
};

// 取消部署
export const useCancelDeployment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deploymentService.cancelDeployment(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({queryKey: deploymentKeys.detail(id)});
            queryClient.invalidateQueries({queryKey: deploymentKeys.lists()});
        },
    });
};

// 回滚部署
export const useRollbackDeployment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deploymentService.rollbackDeployment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: deploymentKeys.lists()});
        },
    });
};
