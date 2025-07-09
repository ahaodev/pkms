import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ThemeProvider} from "@/components/theme-provider";
import {Toaster} from "@/components/ui/toaster";
import {AuthProvider, useAuth} from "@/contexts/simple-auth-context";

import Dashboard from "@/pages/dashboard";
import ProjectsPage from "@/pages/projects";
import PackagesPage from "@/pages/packages";
import LoginPage from "@/pages/login";
import Settings from "@/pages/settings";
import UsersPage from "@/pages/users";
import GroupsPage from "@/pages/groups";
import "./App.css";
import {Layout} from "@/components/layout";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

function AppRoutes() {
    const {user, isLoading, isAdmin} = useAuth();

    // 如果还在加载认证状态，显示加载页面
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">加载中...</p>
                </div>
            </div>
        );
    }

    if (user) {
        return (
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard/>}/>
                    <Route path="/projects" element={<ProjectsPage/>}/>
                    <Route path="/packages" element={<PackagesPage/>}/>
                    {isAdmin() && <Route path="/users" element={<UsersPage/>}/>}
                    {isAdmin() && <Route path="/groups" element={<GroupsPage/>}/>}
                    <Route path="/settings" element={<Settings/>}/>
                    <Route path="*" element={<Navigate to="/" replace/>}/>
                </Routes>
            </Layout>
        );
    }

    return (
        <Routes>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="*" element={<Navigate to="/login" replace/>}/>
        </Routes>
    );
}

function App() {
    return (
        <div className="w-full h-screen">
            <QueryClientProvider client={queryClient}>
                <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                    <AuthProvider>
                        <Router>
                            <AppRoutes/>
                            <Toaster/>
                        </Router>
                    </AuthProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </div>
    );
}

export default App;
