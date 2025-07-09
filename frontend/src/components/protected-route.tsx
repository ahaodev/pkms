import {Navigate, useLocation} from "react-router-dom";
import {useAuth} from "@/contexts/auth-context";
import {Loader2} from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: string[];
}

export function ProtectedRoute({children, requiredRoles = []}: ProtectedRouteProps) {
    const {isAuthenticated, loading, user} = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    <p className="text-lg font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{from: location}} replace/>;
    }

    // Check for required roles
    if (requiredRoles.length > 0) {
        const userRoles = user?.roles || [];
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

        if (!hasRequiredRole) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-background">
                    <div className="flex flex-col items-center space-y-4 max-w-md text-center p-8">
                        <h1 className="text-2xl font-bold">Access Denied</h1>
                        <p className="text-muted-foreground">
                            You don't have permission to access this page. Please contact your administrator if you
                            believe this is an error.
                        </p>
                    </div>
                </div>
            );
        }
    }

    return <>{children}</>;
}