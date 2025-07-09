import {Deployment} from '@/types';

export const mockDeployments: Deployment[] = [
    {
        id: "1",
        name: "Frontend v1.2.3",
        environment: "production",
        status: "successful",
        startTime: new Date(2025, 3, 15, 14, 30),
        endTime: new Date(2025, 3, 15, 14, 34),
        duration: "4m 12s",
        triggeredBy: "Sarah Johnson",
        version: "1.2.3",
        releaseId: "2",
        steps: [
            {name: "Build", status: "completed", duration: "1m 45s"},
            {name: "Test", status: "completed", duration: "1m 20s"},
            {name: "Deploy", status: "completed", duration: "1m 07s"},
        ],
        logs: [
            "2025-04-15 14:30:00 [INFO] Starting deployment of Frontend v1.2.3",
            "2025-04-15 14:30:15 [INFO] Build process initiated",
            "2025-04-15 14:31:45 [INFO] Build completed successfully",
            "2025-04-15 14:32:00 [INFO] Running tests...",
            "2025-04-15 14:33:20 [INFO] All tests passed",
            "2025-04-15 14:33:25 [INFO] Deploying to production environment",
            "2025-04-15 14:34:12 [INFO] Deployment completed successfully"
        ]
    },
    {
        id: "2",
        name: "API Gateway v2.0.1",
        environment: "staging",
        status: "successful",
        startTime: new Date(2025, 3, 14, 11, 15),
        endTime: new Date(2025, 3, 14, 11, 22),
        duration: "6m 45s",
        triggeredBy: "Emma Wilson",
        version: "2.0.1",
        releaseId: "6",
        steps: [
            {name: "Build", status: "completed", duration: "2m 30s"},
            {name: "Test", status: "completed", duration: "2m 45s"},
            {name: "Deploy", status: "completed", duration: "1m 30s"},
        ],
        logs: [
            "2025-04-14 11:15:00 [INFO] Starting deployment of API Gateway v2.0.1",
            "2025-04-14 11:15:30 [INFO] Building application...",
            "2025-04-14 11:18:00 [INFO] Build completed",
            "2025-04-14 11:18:15 [INFO] Running integration tests",
            "2025-04-14 11:21:00 [INFO] Tests completed successfully",
            "2025-04-14 11:21:15 [INFO] Deploying to staging environment",
            "2025-04-14 11:22:45 [INFO] Deployment successful"
        ]
    },
    {
        id: "3",
        name: "Database Migration",
        environment: "qa",
        status: "in_progress",
        startTime: new Date(2025, 3, 15, 9, 0),
        endTime: null,
        duration: "Ongoing",
        triggeredBy: "James Smith",
        version: "1.5.0",
        releaseId: "4",
        steps: [
            {name: "Backup", status: "completed", duration: "2m 10s"},
            {name: "Schema Update", status: "in_progress", duration: "Ongoing"},
            {name: "Data Migration", status: "pending", duration: "-"},
        ],
        logs: [
            "2025-04-15 09:00:00 [INFO] Starting database migration v1.5.0",
            "2025-04-15 09:00:15 [INFO] Creating database backup",
            "2025-04-15 09:02:25 [INFO] Backup completed successfully",
            "2025-04-15 09:02:30 [INFO] Starting schema updates...",
            "2025-04-15 09:15:00 [INFO] Updating table structures..."
        ]
    },
    {
        id: "4",
        name: "Backend v2.2.8",
        environment: "production",
        status: "failed",
        startTime: new Date(2025, 3, 13, 16, 45),
        endTime: new Date(2025, 3, 13, 16, 52),
        duration: "7m 23s",
        triggeredBy: "Michael Rodriguez",
        version: "2.2.8",
        releaseId: "7",
        steps: [
            {name: "Build", status: "completed", duration: "2m 15s"},
            {name: "Test", status: "failed", duration: "3m 45s", error: "Integration test failure in payment module"},
            {name: "Deploy", status: "pending", duration: "-"},
        ],
        logs: [
            "2025-04-13 16:45:00 [INFO] Starting deployment of Backend v2.2.8",
            "2025-04-13 16:45:15 [INFO] Build process started",
            "2025-04-13 16:47:30 [INFO] Build completed successfully",
            "2025-04-13 16:47:45 [INFO] Running test suite...",
            "2025-04-13 16:51:30 [ERROR] Payment integration test failed",
            "2025-04-13 16:51:30 [ERROR] Test suite failed - aborting deployment",
            "2025-04-13 16:52:08 [INFO] Deployment aborted due to test failures"
        ]
    },
    {
        id: "5",
        name: "Mobile App v2.1.0",
        environment: "production",
        status: "successful",
        startTime: new Date(2025, 3, 12, 13, 20),
        endTime: new Date(2025, 3, 12, 13, 28),
        duration: "8m 12s",
        triggeredBy: "David Chen",
        version: "2.1.0",
        releaseId: "8",
        steps: [
            {name: "Build", status: "completed", duration: "3m 20s"},
            {name: "Test", status: "completed", duration: "2m 40s"},
            {name: "Deploy", status: "completed", duration: "2m 12s"},
        ],
        logs: [
            "2025-04-12 13:20:00 [INFO] Starting mobile app deployment v2.1.0",
            "2025-04-12 13:20:30 [INFO] Building mobile application",
            "2025-04-12 13:23:50 [INFO] Build completed successfully",
            "2025-04-12 13:24:00 [INFO] Running mobile tests",
            "2025-04-12 13:26:40 [INFO] All tests passed",
            "2025-04-12 13:26:50 [INFO] Deploying to app stores",
            "2025-04-12 13:28:12 [INFO] Deployment completed successfully"
        ]
    },
    {
        id: "6",
        name: "Frontend v1.2.2",
        environment: "staging",
        status: "successful",
        startTime: new Date(2025, 3, 11, 10, 30),
        endTime: new Date(2025, 3, 11, 10, 35),
        duration: "5m 45s",
        triggeredBy: "Sarah Johnson",
        version: "1.2.2",
        releaseId: "5",
        steps: [
            {name: "Build", status: "completed", duration: "2m 10s"},
            {name: "Test", status: "completed", duration: "2m 15s"},
            {name: "Deploy", status: "completed", duration: "1m 20s"},
        ]
    },
    {
        id: "7",
        name: "API Gateway v2.0.0",
        environment: "qa",
        status: "successful",
        startTime: new Date(2025, 3, 10, 14, 15),
        endTime: new Date(2025, 3, 10, 14, 23),
        duration: "8m 30s",
        triggeredBy: "Emma Wilson",
        version: "2.0.0",
        releaseId: "6",
        steps: [
            {name: "Build", status: "completed", duration: "3m 45s"},
            {name: "Test", status: "completed", duration: "3m 20s"},
            {name: "Deploy", status: "completed", duration: "1m 25s"},
        ]
    },
    {
        id: "8",
        name: "Backend v2.3.0",
        environment: "development",
        status: "cancelled",
        startTime: new Date(2025, 3, 9, 15, 0),
        endTime: new Date(2025, 3, 9, 15, 3),
        duration: "3m 12s",
        triggeredBy: "Michael Rodriguez",
        version: "2.3.0",
        releaseId: "1",
        steps: [
            {name: "Build", status: "completed", duration: "2m 45s"},
            {name: "Test", status: "cancelled", duration: "27s"},
            {name: "Deploy", status: "pending", duration: "-"},
        ]
    }
];
