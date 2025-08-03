// Direct imports instead of lazy loading to avoid route issues
import Dashboard from "@/pages/dashboard";
import HierarchyPage from "@/pages/hierarchy";
import LoginPage from "@/pages/login";
import Settings from "@/pages/settings";
import UsersPage from "@/pages/users";
import PermissionsPage from "@/pages/permissions";
import UpgradePage from "@/pages/upgrade";
import TenantsPage from "@/pages/tenants";
import ClientAccessPage from "@/pages/client-access";
import SharePage from "@/pages/share.tsx";
import SharesManagerPage from "@/pages/shares-manager.tsx";

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
    {
        path: "/share/:code",
        element: SharePage,
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
    {
        path: "/settings",
        element: Settings,
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
        path: "/permissions",
        element: PermissionsPage,
        requiresAuth: true,
        requiresAdmin: true,
    },
    {
        path: "/tenants",
        element: TenantsPage,
        requiresAuth: true,
        requiresAdmin: true,
    },

];
