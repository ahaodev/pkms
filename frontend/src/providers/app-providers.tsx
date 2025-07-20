import {ReactNode} from 'react';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ThemeProvider} from "@/components/theme-provider";
import {AuthProvider} from "./auth-provider";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 0, // No caching - always fresh
            gcTime: 0, // No garbage collection time - immediate cleanup
            refetchOnWindowFocus: false, // Disable to prevent excessive refetching
            refetchOnMount: "always", // Always refetch on mount
            refetchOnReconnect: false, // Disable to prevent excessive refetching
        },
    },
});

interface AppProvidersProps {
    children: ReactNode;
}

export function AppProviders({children}: AppProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
