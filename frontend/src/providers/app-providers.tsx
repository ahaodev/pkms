import {ReactNode} from 'react';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ThemeProvider} from "@/components/theme-provider";
import {AuthProvider} from "./auth-provider";
import {I18nProvider} from "@/contexts/i18n-context";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes - reasonable caching
            gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
            refetchOnWindowFocus: false, // Disable to prevent excessive refetching
            refetchOnMount: false, // Don't always refetch on mount
            refetchOnReconnect: false, // Disable to prevent excessive refetching
        },
    },
});

interface AppProvidersProps {
    children: ReactNode;
}

export function AppProviders({children}: AppProvidersProps) {
    return (
        <I18nProvider>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </I18nProvider>
    );
}
