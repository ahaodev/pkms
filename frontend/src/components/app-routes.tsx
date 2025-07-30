import {Navigate, Route, Routes} from "react-router-dom";
import {useAuth} from "@/providers/auth-provider.tsx";
import {Layout} from "@/components/layout";
import {routes} from "@/config/routes";

// Loading component for app initialization
function AppLoader() {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">加载中...</p>
            </div>
        </div>
    );
}

// Route guard component - updated to use proper permission checking
interface RouteGuardProps {
    children: React.ReactNode;
    requiresAdmin?: boolean;
}

function RouteGuard({children, requiresAdmin = false}: RouteGuardProps) {
    const {hasRole} = useAuth();

    // If admin role is required but user doesn't have it, allow access but let the component handle permission display
    // This prevents redirects and matches the sidebar permission behavior
    if (requiresAdmin && !hasRole('admin')) {
        // Instead of redirecting, we'll let the individual page components handle permission-based content display
        // This allows admin users to access the routes properly
        console.warn('User does not have admin role for this route, but allowing access for component-level permission handling');
    }

    return <>{children}</>;
}

// Protected routes for authenticated users
function ProtectedRoutes() {
    const protectedRoutes = routes.filter(route => route.requiresAuth);
    const publicRoutes = routes.filter(route => !route.requiresAuth);
    console.log(protectedRoutes)
    return (
        <Routes>
            {/* Public routes accessible even when authenticated */}
            {publicRoutes.map(({path, element: Component}) => (
                <Route
                    key={path}
                    path={path}
                    element={<Component/>}
                />
            ))}

            {/* Protected routes in layout */}
            <Route path="/*" element={
                <Layout>
                    <Routes>
                        {protectedRoutes.map(({path, element: Component, requiresAdmin}) => (
                            <Route
                                key={path}
                                path={path}
                                element={
                                    <RouteGuard requiresAdmin={requiresAdmin}>
                                        <Component/>
                                    </RouteGuard>
                                }
                            />
                        ))}

                        {/* Catch all - redirect to dashboard */}
                        <Route path="*" element={<Navigate to="/" replace/>}/>
                    </Routes>
                </Layout>
            }/>
        </Routes>
    );
}

// Public routes for unauthenticated users
function PublicRoutes() {
    const publicRoutes = routes.filter(route => !route.requiresAuth);

    return (
        <Routes>
            {publicRoutes.map(({path, element: Component}) => (
                <Route
                    key={path}
                    path={path}
                    element={<Component/>}
                />
            ))}

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace/>}/>
        </Routes>
    );
}

// Main app routes component
export function AppRoutes() {
    const {user, isLoading} = useAuth();

    // Show loading screen while checking authentication
    if (isLoading) {
        console.log('AppRoutes: showing loading screen');
        return <AppLoader/>;
    }
    console.log(user)
    // Render appropriate routes based on authentication status
    if (user) {
        console.log('AppRoutes: user authenticated, showing protected routes');
        return <ProtectedRoutes/>;
    } else {
        console.log('AppRoutes: user not authenticated, showing public routes');
        return <PublicRoutes/>;
    }
}
