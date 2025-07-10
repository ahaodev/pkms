import { ReactNode } from 'react';
import { AuthContextProvider } from '@/contexts/simple-auth-context';

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
