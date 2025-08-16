// Direct imports instead of lazy loading to avoid route issues
import Dashboard from "@/pages/dashboard";
import HierarchyPage from "@/pages/hierarchy";
import LoginPage from "@/pages/login";
import UsersPage from "@/pages/users";
import UpgradePage from "@/pages/upgrade";
import TenantsPage from "@/pages/tenants";
import ClientAccessPage from "@/pages/client-access";
import SharesManagerPage from "@/pages/shares-manager.tsx";
import MenuManagement from "@/pages/menu-management";
import RoleManagement from "@/pages/role-management";
import UserTenantRoleManagement from "@/pages/user-tenant-role-management";

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
        path: "/menu-management",
        element: MenuManagement,
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
        element: UserTenantRoleManagement,
        requiresAuth: true,
        requiresAdmin: true,
    },

];
