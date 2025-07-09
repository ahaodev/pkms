import {Deployment, DeploymentFilters, ApiResponse, PaginatedResponse} from '@/types';

export interface DeploymentService {
    // Deployment CRUD operations
    getDeployments(filters?: DeploymentFilters): Promise<ApiResponse<PaginatedResponse<Deployment>>>;

    getDeployment(id: string): Promise<ApiResponse<Deployment>>;

    createDeployment(deployment: Omit<Deployment, 'id' | 'startTime' | 'steps' | 'status'>): Promise<ApiResponse<Deployment>>;

    // Deployment actions
    triggerDeployment(releaseId: string, environment: Deployment['environment']): Promise<ApiResponse<Deployment>>;

    cancelDeployment(id: string): Promise<ApiResponse<Deployment>>;

    rollbackDeployment(id: string): Promise<ApiResponse<Deployment>>;

    // Deployment monitoring
    getDeploymentLogs(id: string): Promise<ApiResponse<string[]>>;

    getDeploymentStatus(id: string): Promise<ApiResponse<Deployment['status']>>;
}
