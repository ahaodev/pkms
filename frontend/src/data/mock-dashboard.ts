import {DashboardStats, ChartData, Environment, ActivityItem} from '@/types';

export const mockDashboardStats: DashboardStats = {
    totalReleases: 128,
    totalDeployments: 284,
    avgDeploymentTime: "6m 32s",
    successRate: 98.2,
    releasesGrowth: "+12%",
    deploymentsGrowth: "+8%",
    timeImprovement: "-15%",
    successRateChange: "+2.4%"
};

export const mockDeploymentChartData: ChartData[] = [
    {name: "Mon", deployments: 4},
    {name: "Tue", deployments: 7},
    {name: "Wed", deployments: 5},
    {name: "Thu", deployments: 6},
    {name: "Fri", deployments: 8},
    {name: "Sat", deployments: 3},
    {name: "Sun", deployments: 2},
];

export const mockDeploymentTimeData: ChartData[] = [
    {name: "Week 1", time: 15},
    {name: "Week 2", time: 12},
    {name: "Week 3", time: 8},
    {name: "Week 4", time: 7},
    {name: "Week 5", time: 6},
    {name: "Week 6", time: 7},
    {name: "Week 7", time: 5},
];

export const mockEnvironmentData: Environment[] = [
    {name: "Production", value: 8, color: "hsl(var(--chart-1))"},
    {name: "Staging", value: 16, color: "hsl(var(--chart-2))"},
    {name: "QA", value: 24, color: "hsl(var(--chart-3))"},
    {name: "Development", value: 32, color: "hsl(var(--chart-4))"},
];

export const mockRecentActivity: ActivityItem[] = [
    {
        id: "1",
        type: "deployment",
        title: "Frontend v1.2.3 deployed",
        description: "Successfully deployed to production environment",
        timestamp: new Date(2025, 3, 15, 14, 34),
        user: "Sarah Johnson",
        status: "success",
        environment: "production"
    },
    {
        id: "2",
        type: "release",
        title: "Backend v2.3.1 ready for deployment",
        description: "Release approved and ready for production deployment",
        timestamp: new Date(2025, 3, 15, 12, 20),
        user: "Michael Rodriguez",
        status: "pending",
        environment: "production"
    },
    {
        id: "3",
        type: "deployment",
        title: "API Gateway v2.0.1 deployed",
        description: "Successfully deployed to staging environment",
        timestamp: new Date(2025, 3, 14, 11, 22),
        user: "Emma Wilson",
        status: "success",
        environment: "staging"
    },
    {
        id: "4",
        type: "rollback",
        title: "Backend v2.2.8 deployment rolled back",
        description: "Deployment failed and was automatically rolled back",
        timestamp: new Date(2025, 3, 13, 16, 52),
        user: "Michael Rodriguez",
        status: "failed",
        environment: "production"
    },
    {
        id: "5",
        type: "approval",
        title: "Mobile API v3.0.0 submitted for review",
        description: "Release submitted for security and compliance review",
        timestamp: new Date(2025, 3, 12, 15, 30),
        user: "David Chen",
        status: "pending",
        environment: "staging"
    },
    {
        id: "6",
        type: "deployment",
        title: "Mobile App v2.1.0 deployed",
        description: "Successfully deployed to app stores",
        timestamp: new Date(2025, 3, 12, 13, 28),
        user: "David Chen",
        status: "success",
        environment: "production"
    },
    {
        id: "7",
        type: "release",
        title: "Database Migration v1.5.0 started",
        description: "Database schema update deployment in progress",
        timestamp: new Date(2025, 3, 10, 9, 0),
        user: "James Smith",
        status: "in_progress",
        environment: "qa"
    },
    {
        id: "8",
        type: "deployment",
        title: "Frontend v1.2.2 deployed",
        description: "Successfully deployed to staging environment",
        timestamp: new Date(2025, 3, 11, 10, 35),
        user: "Sarah Johnson",
        status: "success",
        environment: "staging"
    }
];
