import {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import * as authAPI from '@/lib/api/auth.ts';
import {ACCESS_TOKEN, CURRENT_TENANT, REFRESH_TOKEN} from '@/types/constants.ts';
import {Tenant, User} from '@/types/user';

interface AuthContextType {
    user: User | null;
    currentTenant: Tenant | null;
    tenants: Tenant[] | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    selectTenant: (tenant: Tenant | null) => void;
    isLoading: boolean;
    isAdmin: () => boolean;
}

export const useAuth = () => useContext(AuthContext);

const AuthContext = createContext<AuthContextType>({
    user: null,
    currentTenant: null,
    tenants: null,
    login: async () => false,
    logout: () => {
    },
    selectTenant: () => {

    },
    isLoading: false,
    isAdmin: () => false,
});


export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [tenants, setTenants] = useState<Tenant[] | null>(null);
    const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            setIsLoading(true);
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (!accessToken) {
                setUser(null);
                setTenants(null);
                setCurrentTenant(null);
                setIsLoading(false);
                return;
            }
            try {
                const resp = await authAPI.validateToken();
                console.log('validateToken resp:', resp);
                if (resp.code === 0 && resp.data) {
                    // profile data should contain user info
                    const user: User = {
                        id: resp.data.id,
                        name: resp.data.name,
                        created_at: new Date(),
                        updated_at: new Date(),
                        is_active: true,
                    }
                    setUser(user);
                    const tenantsArr = Array.isArray(resp.data.tenants) ? resp.data.tenants : null;
                    setTenants(tenantsArr);
                    selectTenant(tenantsArr && tenantsArr.length > 0 ? tenantsArr[0] : null);
                } else {
                    setUser(null);
                    setTenants(null);
                    selectTenant(null);
                }
            } catch (e) {
                console.log('validateToken error:', e);
                setUser(null);
                setTenants(null);
                selectTenant(null);
            }
            setIsLoading(false);
        };
        initializeAuth();
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const loginResp = await authAPI.login({username, password});
            if (loginResp.code === 0 && loginResp.data) {
                // login successful, store tokens and user info
                localStorage.setItem(ACCESS_TOKEN, loginResp.data.accessToken);
                localStorage.setItem(REFRESH_TOKEN, loginResp.data.refreshToken);
                //
                const profileResp = await authAPI.validateToken();
                if (profileResp.code === 0 && profileResp.data) {
                    const user: User = {
                        id: profileResp.data.id,
                        name: profileResp.data.name,
                        created_at: new Date(),
                        updated_at: new Date(),
                        is_active: true,
                    }
                    setUser(user);
                    setTenants(profileResp.data.tenants || null);
                    selectTenant(profileResp.data.tenants[0] || null);
                }

                return true;
            }

            return false;
        } catch (e) {
            console.log(e)
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setTenants(null);
        setCurrentTenant(null);
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        localStorage.removeItem(CURRENT_TENANT);
    };
    const selectTenant = (tenant: Tenant | null) => {
        setCurrentTenant(tenant);
        localStorage.setItem(CURRENT_TENANT, tenant ? tenant.id : '');
    }
    const isAdmin = (): boolean => user?.name === 'admin';
    const contextValue = {
        user,
        tenants,
        currentTenant,
        login,
        logout,
        selectTenant,
        isLoading,
        isAdmin,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}
