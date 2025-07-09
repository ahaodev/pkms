import {DeploymentService} from '@/services/interfaces/deployment-service.interface';
import {Deployment, DeploymentFilters, ApiResponse, PaginatedResponse} from '@/types';
import {mockDeployments} from '@/data/mock-deployments';

export class MockDeploymentService implements DeploymentService {
    private deployments: Deployment[] = [...mockDeployments];

    async getDeployments(filters?: DeploymentFilters): Promise<ApiResponse<PaginatedResponse<Deployment>>> {
        await this.delay(300);

        let filteredDeployments = [...this.deployments];

        if (filters) {
            if (filters.status) {
                filteredDeployments = filteredDeployments.filter(deployment => deployment.status === filters.status);
            }
            if (filters.environment) {
                filteredDeployments = filteredDeployments.filter(deployment => deployment.environment === filters.environment);
            }
            if (filters.triggeredBy) {
                filteredDeployments = filteredDeployments.filter(deployment =>
                    deployment.triggeredBy.toLowerCase().includes(filters.triggeredBy!.toLowerCase())
                );
            }
            if (filters.dateFrom) {
                filteredDeployments = filteredDeployments.filter(deployment => deployment.startTime >= filters.dateFrom!);
            }
            if (filters.dateTo) {
                filteredDeployments = filteredDeployments.filter(deployment => deployment.startTime <= filters.dateTo!);
            }
        }

        // Sort by start time (newest first)
        filteredDeployments.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

        return {
            data: {
                data: filteredDeployments,
                pagination: {
                    page: 1,
                    limit: 50,
                    total: filteredDeployments.length,
                    pages: 1
                }
            },
            success: true
        };
    }

    async getDeployment(id: string): Promise<ApiResponse<Deployment>> {
        await this.delay(200);

        const deployment = this.deployments.find(d => d.id === id);
        if (!deployment) {
            return {
                data: {} as Deployment,
                success: false,
                message: 'Deployment not found',
                errors: ['Deployment with the specified ID does not exist']
            };
        }

        return {
            data: deployment,
            success: true
        };
    }

    async createDeployment(deploymentData: Omit<Deployment, 'id' | 'startTime' | 'steps' | 'status'>): Promise<ApiResponse<Deployment>> {
        await this.delay(500);

        const newDeployment: Deployment = {
            ...deploymentData,
            id: (this.deployments.length + 1).toString(),
            startTime: new Date(),
            status: 'pending',
            steps: [
                {name: "Build", status: "pending", duration: "-"},
                {name: "Test", status: "pending", duration: "-"},
                {name: "Deploy", status: "pending", duration: "-"},
            ]
        };

        this.deployments.push(newDeployment);

        return {
            data: newDeployment,
            success: true,
            message: 'Deployment created successfully'
        };
    }

    async triggerDeployment(releaseId: string, environment: Deployment['environment']): Promise<ApiResponse<Deployment>> {
        await this.delay(1000);

        // Simulate creating a deployment from a release
        const newDeployment: Deployment = {
            id: (this.deployments.length + 1).toString(),
            name: `Release ${releaseId} deployment`,
            environment,
            status: 'in_progress',
            startTime: new Date(),
            endTime: null,
            duration: 'In progress',
            triggeredBy: 'Current User',
            version: '1.0.0',
            releaseId,
            steps: [
                {name: "Build", status: "in_progress", duration: "Ongoing"},
                {name: "Test", status: "pending", duration: "-"},
                {name: "Deploy", status: "pending", duration: "-"},
            ]
        };

        this.deployments.push(newDeployment);

        return {
            data: newDeployment,
            success: true,
            message: 'Deployment triggered successfully'
        };
    }

    async cancelDeployment(id: string): Promise<ApiResponse<Deployment>> {
        await this.delay(300);

        const deploymentIndex = this.deployments.findIndex(d => d.id === id);
        if (deploymentIndex === -1) {
            return {
                data: {} as Deployment,
                success: false,
                message: 'Deployment not found',
                errors: ['Deployment with the specified ID does not exist']
            };
        }

        this.deployments[deploymentIndex].status = 'cancelled';
        this.deployments[deploymentIndex].endTime = new Date();

        return {
            data: this.deployments[deploymentIndex],
            success: true,
            message: 'Deployment cancelled successfully'
        };
    }

    async rollbackDeployment(id: string): Promise<ApiResponse<Deployment>> {
        await this.delay(800);

        const deployment = this.deployments.find(d => d.id === id);
        if (!deployment) {
            return {
                data: {} as Deployment,
                success: false,
                message: 'Deployment not found',
                errors: ['Deployment with the specified ID does not exist']
            };
        }

        // Create a rollback deployment
        const rollbackDeployment: Deployment = {
            id: (this.deployments.length + 1).toString(),
            name: `Rollback: ${deployment.name}`,
            environment: deployment.environment,
            status: 'successful',
            startTime: new Date(),
            endTime: new Date(Date.now() + 300000), // 5 minutes later
            duration: '5m 12s',
            triggeredBy: 'Current User',
            version: 'Previous Version',
            releaseId: deployment.releaseId,
            steps: [
                {name: "Rollback", status: "completed", duration: "5m 12s"},
            ],
            rollbackDeploymentId: deployment.id
        };

        this.deployments.push(rollbackDeployment);

        return {
            data: rollbackDeployment,
            success: true,
            message: 'Rollback deployment completed successfully'
        };
    }

    async getDeploymentLogs(id: string): Promise<ApiResponse<string[]>> {
        await this.delay(200);

        const deployment = this.deployments.find(d => d.id === id);
        if (!deployment) {
            return {
                data: [],
                success: false,
                message: 'Deployment not found',
                errors: ['Deployment with the specified ID does not exist']
            };
        }

        return {
            data: deployment.logs || [],
            success: true
        };
    }

    async getDeploymentStatus(id: string): Promise<ApiResponse<Deployment['status']>> {
        await this.delay(100);

        const deployment = this.deployments.find(d => d.id === id);
        if (!deployment) {
            return {
                data: 'failed',
                success: false,
                message: 'Deployment not found',
                errors: ['Deployment with the specified ID does not exist']
            };
        }

        return {
            data: deployment.status,
            success: true
        };
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
