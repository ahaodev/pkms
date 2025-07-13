// Direct imports instead of lazy loading to avoid route issues
import Dashboard from "@/pages/dashboard";
import ProjectsPage from "@/pages/projects";
import PackagesPage from "@/pages/packages";
import LoginPage from "@/pages/login";
import Settings from "@/pages/settings";
import UsersPage from "@/pages/users";
import GroupsPage from "@/pages/groups";
import PermissionsPage from "@/pages/permissions";

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
    
    // Protected routes
    {
        path: "/",
        element: Dashboard,
        requiresAuth: true,
    },
    {
        path: "/projects",
        element: ProjectsPage,
        requiresAuth: true,
    },
    {
        path: "/packages",
        element: PackagesPage,
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
        path: "/groups",
        element: GroupsPage,
        requiresAuth: true,
        requiresAdmin: true,
    },
    {
        path: "/permissions",
        element: PermissionsPage,
        requiresAuth: true,
        requiresAdmin: true,
    },
];
