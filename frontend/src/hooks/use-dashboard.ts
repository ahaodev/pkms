// use-dashboard.ts
// Dashboard 相关数据的自定义 hooks，基于 react-query 实现，直接调用 API

// Query keys
export const dashboardKeys = {
    all: ['dashboard'] as const,
    stats: () => [...dashboardKeys.all, 'stats'] as const,
    deploymentChart: (days?: number) => [...dashboardKeys.all, 'deploymentChart', days] as const,
    deploymentTime: (weeks?: number) => [...dashboardKeys.all, 'deploymentTime', weeks] as const,
    environment: () => [...dashboardKeys.all, 'environment'] as const,
    activity: (limit?: number) => [...dashboardKeys.all, 'activity', limit] as const,
    successRate: (days?: number) => [...dashboardKeys.all, 'successRate', days] as const,
    avgTime: (days?: number) => [...dashboardKeys.all, 'avgTime', days] as const,
};


