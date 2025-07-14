import { ReactNode } from 'react';
import { AuthContextProvider } from '@/contexts/auth-context.tsx';

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    return (
        <AuthContextProvider>
            {children}
        </AuthContextProvider>
    );
}
