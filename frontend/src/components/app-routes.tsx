import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/simple-auth-context";
import { Layout } from "@/components/layout";
import { routes } from "@/config/routes";

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

// Route guard component
interface RouteGuardProps {
    children: React.ReactNode;
    requiresAdmin?: boolean;
}

function RouteGuard({ children, requiresAdmin = false }: RouteGuardProps) {
    const { isAdmin } = useAuth();
    
    if (requiresAdmin && !isAdmin()) {
        return <Navigate to="/" replace />;
    }
    
    return <>{children}</>;
}

// Protected routes for authenticated users
function ProtectedRoutes() {
    const protectedRoutes = routes.filter(route => route.requiresAuth);
    
    return (
        <Layout>
            <Routes>
                {protectedRoutes.map(({ path, element: Component, requiresAdmin }) => (
                    <Route
                        key={path}
                        path={path}
                        element={
                            <RouteGuard requiresAdmin={requiresAdmin}>
                                <Component />
                            </RouteGuard>
                        }
                    />
                ))}
                
                {/* Catch all - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    );
}

// Public routes for unauthenticated users
function PublicRoutes() {
    const publicRoutes = routes.filter(route => !route.requiresAuth);
    
    return (
        <Routes>
            {publicRoutes.map(({ path, element: Component }) => (
                <Route
                    key={path}
                    path={path}
                    element={<Component />}
                />
            ))}
            
            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

// Main app routes component
export function AppRoutes() {
    const { user, isLoading } = useAuth();

    // Debug logging
    console.log('AppRoutes render:', { 
        user: user?.username, 
        userId: user?.id,
        isLoading,
        hasStoredUser: !!localStorage.getItem('pkms_user'),
        hasStoredToken: !!localStorage.getItem('pkms_access_token'),
        timestamp: new Date().toISOString()
    });

    // Show loading screen while checking authentication
    if (isLoading) {
        console.log('AppRoutes: showing loading screen');
        return <AppLoader />;
    }

    // Render appropriate routes based on authentication status
    if (user) {
        console.log('AppRoutes: user authenticated, showing protected routes');
        return <ProtectedRoutes />;
    } else {
        console.log('AppRoutes: user not authenticated, showing public routes');
        return <PublicRoutes />;
    }
}
