import {ReactNode} from 'react';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ThemeProvider} from "@/components/theme-provider";
import {AuthProvider} from "./auth-provider";
import {I18nProvider} from "@/contexts/i18n-context";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 0,
            gcTime: 0,
            refetchOnWindowFocus: true,
            refetchOnMount: true,
            refetchOnReconnect: true,
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
