import React, {Suspense, useMemo} from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import {useAuth} from "@/providers/auth-provider.tsx";
import {Layout} from "@/components/layout";
import {routes} from "@/config/routes";
import {useI18n} from "@/contexts/i18n-context";

// Loading component for app initialization
function AppLoader() {
    const { t } = useI18n();
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">{t('common.loading')}</p>
            </div>
        </div>
    );
}

// Error boundary for route loading failures
interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

// Error content component with i18n support
function ErrorContent() {
    const { t } = useI18n();
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <h2 className="text-lg font-semibold text-destructive mb-2">{t('common.pageLoadFailed')}</h2>
                <p className="text-muted-foreground mb-4">{t('common.refreshPagePrompt')}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                    {t('common.refreshPage')}
                </button>
            </div>
        </div>
    );
}

class RouteErrorBoundary extends React.Component<
    { children: React.ReactNode },
    ErrorBoundaryState
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return <ErrorContent />;
        }

        return this.props.children;
    }
}

// Route guard component - optimized for better permission handling
interface RouteGuardProps {
    children: React.ReactNode;
    requiresAdmin?: boolean;
}

function RouteGuard({children, requiresAdmin = false}: RouteGuardProps) {
    console.log(requiresAdmin);
    // Allow access for component-level permission handling
    // Individual components will handle permission-based content display
    return <>{children}</>;
}

// Protected routes for authenticated users
function ProtectedRoutes() {
    // Memoize route filtering to avoid repeated calculations
    const {protectedRoutes, publicRoutes} = useMemo(() => ({
        protectedRoutes: routes.filter(route => route.requiresAuth),
        publicRoutes: routes.filter(route => !route.requiresAuth)
    }), []);

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
                    <Suspense fallback={
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    }>
                        <RouteErrorBoundary>
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
                        </RouteErrorBoundary>
                    </Suspense>
                </Layout>
            }/>
        </Routes>
    );
}

// Public routes for unauthenticated users
function PublicRoutes() {
    // Memoize public routes filtering
    const publicRoutes = useMemo(() => 
        routes.filter(route => !route.requiresAuth), []
    );

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <RouteErrorBoundary>
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
            </RouteErrorBoundary>
        </Suspense>
    );
}

// Main app routes component
export function AppRoutes() {
    const {user, isLoading} = useAuth();

    // Show loading screen while checking authentication
    if (isLoading) {
        return <AppLoader/>;
    }

    // Render appropriate routes based on authentication status
    return user ? <ProtectedRoutes/> : <PublicRoutes/>;
}
