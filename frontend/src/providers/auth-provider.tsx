import {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import * as authAPI from '@/lib/api/auth.ts';
import {ACCESS_TOKEN, CURRENT_TENANT, REFRESH_TOKEN} from '@/types/constants.ts';
import {Tenant, User, UserPermissions} from '@/types/user';
import NoPermissionsPage from '@/pages/no-permissions';

interface AuthContextType {
    user: User | null;
    currentTenant: Tenant | null;
    tenants: Tenant[] | null;
    userPermissions: UserPermissions | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    selectTenant: (tenant: Tenant | null) => Promise<void>;
    isLoading: boolean;
    isAdmin: () => boolean;
}

export const useAuth = () => useContext(AuthContext);

const AuthContext = createContext<AuthContextType>({
    user: null,
    currentTenant: null,
    tenants: null,
    userPermissions: null,
    login: async () => false,
    logout: () => {
    },
    selectTenant: async () => {

    },
    isLoading: false,
    isAdmin: () => false,
});


export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [tenants, setTenants] = useState<Tenant[] | null>(null);
    const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
    const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const queryClient = useQueryClient();

    const loadUserPermissions = async () => {
        if (!user?.id || !currentTenant?.id) {
            setUserPermissions(null);
            return;
        }

        try {
            const permissionsResp = await authAPI.getUserPermissions(user.id);
            if (permissionsResp.code === 0) {
                setUserPermissions(permissionsResp.data);
            } else {
                setUserPermissions(null);
            }
        } catch (error) {
            console.error(error)
            setUserPermissions(null);
        }
    };

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
                    await selectTenant(tenantsArr && tenantsArr.length > 0 ? tenantsArr[0] : null);
                } else {
                    setUser(null);
                    setTenants(null);
                    await selectTenant(null);
                }
            } catch (e) {
                console.error(e);
                setUser(null);
                setTenants(null);
                await selectTenant(null);
            }
            setIsLoading(false);
        };
        initializeAuth();
    }, []);

    // Load user permissions when user or tenant changes
    useEffect(() => {
        if (user?.id && currentTenant?.id) {
            // 使用debounce避免频繁调用
            const timeoutId = setTimeout(() => {
                loadUserPermissions();
            }, 100);
            return () => clearTimeout(timeoutId);
        }
    }, [user?.id, currentTenant?.id]);

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
                    await selectTenant(profileResp.data.tenants[0] || null);
                }

                return true;
            }

            return false;
        } catch (e) {
            console.error(e);
            // 重新抛出错误，让上层能够获取具体的错误信息
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setTenants(null);
        setCurrentTenant(null);
        setUserPermissions(null);
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        localStorage.removeItem(CURRENT_TENANT);
    };
    const selectTenant = async (tenant: Tenant | null) => {
        const previousTenantId = currentTenant?.id;
        setCurrentTenant(tenant);
        localStorage.setItem(CURRENT_TENANT, tenant ? tenant.id : '');

        // 仅在租户真正发生变化时才清除缓存，避免初始化时的不必要清除
        if (previousTenantId && previousTenantId !== tenant?.id) {
            // 仅清除与租户相关的查询，而不是所有查询
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
    };
    const isAdmin = (): boolean => userPermissions?.roles?.includes("admin") ?? false;
    const contextValue = {
        user,
        tenants,
        currentTenant,
        userPermissions,
        login,
        logout,
        selectTenant,
        isLoading,
        isAdmin,
    };

    // Show loading while initializing
    if (isLoading) {
        return (
            <AuthContext.Provider value={contextValue}>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">Loading...</p>
                    </div>
                </div>
            </AuthContext.Provider>
        );
    }

    // Show no permissions page if user is authenticated but has no tenants
    if (user && (!tenants || tenants.length === 0)) {
        return (
            <AuthContext.Provider value={contextValue}>
                <NoPermissionsPage />
            </AuthContext.Provider>
        );
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}
