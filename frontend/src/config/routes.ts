// Lazy loading for better code splitting and performance
import { lazy } from 'react';

// Critical pages - load immediately
import LoginPage from "@/pages/login";

// Non-critical pages - lazy load
const Dashboard = lazy(() => import("@/pages/dashboard"));
const HierarchyPage = lazy(() => import("@/pages/hierarchy"));
const UsersPage = lazy(() => import("@/pages/sys-users"));
const UpgradePage = lazy(() => import("@/pages/upgrade"));
const TenantsPage = lazy(() => import("@/pages/sys-tenants"));
const ClientAccessPage = lazy(() => import("@/pages/client-access"));
const SharesManagerPage = lazy(() => import("@/pages/shares"));
const RoleManagement = lazy(() => import("@/pages/sys-roles"));
const UserTenantRole = lazy(() => import("@/pages/sys-user-tenant-role"));

export interface RouteConfig {
    path: string;
    element: React.ComponentType;
    requiresAuth: boolean;
    requiresAdmin?: boolean;
}

export const routes: RouteConfig[] = [
    // Public routes
    {
        path: "/login",
        element: LoginPage,
        requiresAuth: false,
    },
    // Main dashboard
    {
        path: "/",
        element: Dashboard,
        requiresAuth: true,
    },
    // Hierarchy and settings
    {
        path: "/hierarchy",
        element: HierarchyPage,
        requiresAuth: true,
    },
    {
        path: "/upgrade",
        element: UpgradePage,
        requiresAuth: true,
    }, {
        path: "/access-manager",
        element: ClientAccessPage,
        requiresAuth: true,
    },
    {
        path: "/shares",
        element: SharesManagerPage,
        requiresAuth: true,
    },

    // Admin-only routes
    {
        path: "/users",
        element: UsersPage,
        requiresAuth: true,
        requiresAdmin: true,
    },
    {
        path: "/tenants",
        element: TenantsPage,
        requiresAuth: true,
        requiresAdmin: true,
    },
    {
        path: "/role-management",
        element: RoleManagement,
        requiresAuth: true,
        requiresAdmin: true,
    },
    {
        path: "/user-tenant-role-management",
        element: UserTenantRole,
        requiresAuth: true,
        requiresAdmin: true,
    },

];
