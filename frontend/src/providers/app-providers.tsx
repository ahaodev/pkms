import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "./auth-provider";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

interface AppProvidersProps {
    children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
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
