import {Release} from '@/types';

export const mockReleases: Release[] = [
    {
        id: "1",
        name: "Backend v2.3.1",
        version: "2.3.1",
        type: "backend",
        status: "ready",
        createdAt: new Date(2025, 3, 15),
        author: "Michael Rodriguez",
        description: "Fixes critical performance issues in the backend service",
        environment: "production",
        changeLog: [
            "Fixed memory leak in user authentication service",
            "Improved API response times by 25%",
            "Updated dependencies to latest versions",
            "Added better error handling for database connections"
        ],
        artifacts: [
            {
                id: "artifact-1",
                name: "backend-v2.3.1.jar",
                type: "jar",
                size: 45678901,
                url: "/artifacts/backend-v2.3.1.jar",
                checksum: "sha256:a1b2c3d4e5f6..."
            }
        ]
    },
    {
        id: "2",
        name: "Frontend v1.2.3",
        version: "1.2.3",
        type: "frontend",
        status: "deployed",
        createdAt: new Date(2025, 3, 14),
        author: "Sarah Johnson",
        description: "UI improvements and bug fixes",
        environment: "production",
        changeLog: [
            "Updated dashboard layout for better usability",
            "Fixed responsive design issues on mobile",
            "Added dark mode support",
            "Improved accessibility features"
        ],
        artifacts: [
            {
                id: "artifact-2",
                name: "frontend-v1.2.3.zip",
                type: "zip",
                size: 12345678,
                url: "/artifacts/frontend-v1.2.3.zip",
                checksum: "sha256:b2c3d4e5f6a1..."
            }
        ]
    },
    {
        id: "3",
        name: "Mobile API v3.0.0",
        version: "3.0.0",
        type: "api",
        status: "in_review",
        createdAt: new Date(2025, 3, 12),
        author: "David Chen",
        description: "New mobile-specific endpoints and authentication improvements",
        environment: "staging",
        changeLog: [
            "Added OAuth2 authentication flow",
            "Implemented push notification endpoints",
            "Added mobile device management APIs",
            "Improved rate limiting for mobile clients"
        ]
    },
    {
        id: "4",
        name: "Database Migration v1.5",
        version: "1.5.0",
        type: "database",
        status: "in_progress",
        createdAt: new Date(2025, 3, 10),
        author: "James Smith",
        description: "Schema updates for new features",
        environment: "qa",
        changeLog: [
            "Added new user preferences table",
            "Updated indexing for better performance",
            "Added foreign key constraints",
            "Migrated legacy data format"
        ]
    },
    {
        id: "5",
        name: "Frontend v1.3.0",
        version: "1.3.0",
        type: "frontend",
        status: "in_development",
        createdAt: new Date(2025, 3, 8),
        author: "Emma Wilson",
        description: "UI improvements and new dashboard components",
        environment: "development",
        changeLog: [
            "Added real-time deployment monitoring",
            "Implemented new chart components",
            "Added user management interface",
            "Improved navigation structure"
        ]
    },
    {
        id: "6",
        name: "API Gateway v2.0.1",
        version: "2.0.1",
        type: "api",
        status: "ready",
        createdAt: new Date(2025, 3, 6),
        author: "Emma Wilson",
        description: "Security updates and performance improvements",
        environment: "staging",
        changeLog: [
            "Updated JWT token handling",
            "Added request rate limiting",
            "Improved error responses",
            "Updated OpenAPI documentation"
        ]
    },
    {
        id: "7",
        name: "Payment Service v1.4.2",
        version: "1.4.2",
        type: "backend",
        status: "failed",
        createdAt: new Date(2025, 3, 4),
        author: "Michael Rodriguez",
        description: "Payment processing improvements",
        environment: "qa",
        changeLog: [
            "Added support for new payment methods",
            "Improved transaction logging",
            "Added retry mechanism for failed payments",
            "Updated PCI compliance measures"
        ]
    },
    {
        id: "8",
        name: "Mobile App v2.1.0",
        version: "2.1.0",
        type: "mobile",
        status: "deployed",
        createdAt: new Date(2025, 3, 2),
        author: "David Chen",
        description: "New features and performance optimizations",
        environment: "production",
        changeLog: [
            "Added offline mode support",
            "Implemented biometric authentication",
            "Added push notifications",
            "Improved app startup time by 30%"
        ]
    }
];
