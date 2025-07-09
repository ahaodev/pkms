import {DashboardService} from '@/services/interfaces/dashboard-service.interface';
import {DashboardStats, ChartData, Environment, ActivityItem, ApiResponse} from '@/types';
import {
    mockDashboardStats,
    mockDeploymentChartData,
    mockDeploymentTimeData,
    mockEnvironmentData,
    mockRecentActivity
} from '@/data/mock-dashboard';

export class MockDashboardService implements DashboardService {
    async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
        await this.delay(300);

        return {
            data: mockDashboardStats,
            success: true
        };
    }

    async getDeploymentChartData(_days: number = 7): Promise<ApiResponse<ChartData[]>> {
        await this.delay(200);

        // For this mock, we'll return the same data regardless of the days parameter
        // In a real implementation, this would filter based on the days parameter
        return {
            data: mockDeploymentChartData,
            success: true
        };
    }

    async getDeploymentTimeData(_weeks: number = 7): Promise<ApiResponse<ChartData[]>> {
        await this.delay(200);

        // For this mock, we'll return the same data regardless of the weeks parameter
        // In a real implementation, this would filter based on the weeks parameter
        return {
            data: mockDeploymentTimeData,
            success: true
        };
    }

    async getEnvironmentDistribution(): Promise<ApiResponse<Environment[]>> {
        await this.delay(150);

        return {
            data: mockEnvironmentData,
            success: true
        };
    }

    async getRecentActivity(limit: number = 10): Promise<ApiResponse<ActivityItem[]>> {
        await this.delay(250);

        const limitedActivity = mockRecentActivity.slice(0, limit);

        return {
            data: limitedActivity,
            success: true
        };
    }

    async getSuccessRateMetrics(_days: number = 30): Promise<ApiResponse<{ rate: number; trend: string }>> {
        await this.delay(200);

        // Mock calculation based on deployment history
        const rate = Math.random() * 5 + 95; // Random rate between 95-100%
        const trend = Math.random() > 0.5 ? '+' : '-';
        const change = (Math.random() * 5).toFixed(1);

        return {
            data: {
                rate: Number(rate.toFixed(1)),
                trend: `${trend}${change}%`
            },
            success: true
        };
    }

    async getAverageDeploymentTime(_days: number = 30): Promise<ApiResponse<{ time: string; trend: string }>> {
        await this.delay(200);

        // Mock calculation
        const minutes = Math.floor(Math.random() * 10) + 3; // 3-13 minutes
        const seconds = Math.floor(Math.random() * 60); // 0-59 seconds
        const time = `${minutes}m ${seconds}s`;

        const trend = Math.random() > 0.3 ? '-' : '+'; // Favor improvement
        const change = (Math.random() * 20).toFixed(0);

        return {
            data: {
                time,
                trend: `${trend}${change}%`
            },
            success: true
        };
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
