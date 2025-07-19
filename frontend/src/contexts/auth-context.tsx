import {createContext, useContext, useEffect, useState} from 'react';
import * as authAPI from '@/lib/api/auth';
import {ACCESS_TOKEN, REFRESH_TOKEN} from "@/types/constants.ts";
import {jwtDecode} from "jwt-decode";
import {Tenant, User} from '@/types/simplified';

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
    isAdmin: () => boolean;
}


function parseUser(token: string | null): User | null {
    if (!token) return null;
    type CustomJwtPayload = {
        id: string;
        name: string;
    };
    const jwt = jwtDecode<CustomJwtPayload>(token);
    if (!jwt.id || !jwt.name) return null;
    return {
        createdAt: new Date(),
        email: "",
        isActive: true,
        id: jwt.id,
        username: jwt.name
    };
}


const AuthContext = createContext<AuthContextType>({
    user: null,
    login: async () => false,
    logout: () => {
    },
    isLoading: false,
    isAdmin: () => false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthContextProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isValidatingToken, setIsValidatingToken] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            const storedUser = parseUser(accessToken);
            if (storedUser) {
                setUser(storedUser);
                if (accessToken && !isValidatingToken) {
                    setIsValidatingToken(true);
                    setTimeout(() => {
                        authAPI.validateToken()
                            .then(response => {
                                if (response.code === 0 && response.data) {
                                    setUser(response.data.User);
                                    setTenant(response.data.Tenants[0] || null);
                                    console.log(user)
                                    console.log(tenant)
                                }
                            })
                            .catch((e) => {
                                console.log(e)
                            })
                            .finally(() => setIsValidatingToken(false));
                    }, 500);
                }
            }
            setIsLoading(false);
        };
        initializeAuth();
    }, [isValidatingToken]);

    const login = async (username: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const response = await authAPI.login({username, password});
            if (response.code === 0 && response.data) {
                localStorage.setItem(ACCESS_TOKEN, response.data.accessToken);
                localStorage.setItem(REFRESH_TOKEN, response.data.refreshToken);
                const userResponse = await authAPI.validateToken();
                if (userResponse.code === 0 && userResponse.data) {
                    setUser(userResponse.data.User);
                    setTenant(userResponse.data.Tenants[0]);
                    console.log(user)
                    console.log(tenant)
                }
                setIsLoading(false);
                return true;
            }
            setIsLoading(false);
            return false;
        } catch {
            setIsLoading(false);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
    };

    const isAdmin = (): boolean => user?.username === 'admin';
    const contextValue = {
        user,
        login,
        logout,
        isLoading,
        isAdmin,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}