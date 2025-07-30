import {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import * as authAPI from '@/lib/api/auth.ts';
import {ACCESS_TOKEN, CURRENT_TENANT, REFRESH_TOKEN} from '@/types/constants.ts';
import {Tenant, User, UserPermissions} from '@/types/user';

interface AuthContextType {
    user: User | null;
    currentTenant: Tenant | null;
    tenants: Tenant[] | null;
    userPermissions: UserPermissions | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    selectTenant: (tenant: Tenant | null) => Promise<void>;
    isLoading: boolean;
    hasRole: (role: string) => boolean;
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
    hasRole: () => false,
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
        if (!user?.id) {
            console.log('No user ID, clearing permissions');
            setUserPermissions(null);
            return;
        }
        
        console.log('Loading permissions for user:', user.id, 'name:', user.name);
        try {
            const permissionsResp = await authAPI.getUserPermissions(user.id);
            console.log('Permissions API response:', permissionsResp);
            if (permissionsResp.code === 0) {
                console.log('Setting user permissions:', permissionsResp.data);
                setUserPermissions(permissionsResp.data);
            } else {
                console.error('Permissions API returned error code:', permissionsResp.code);
                setUserPermissions(null);
            }
        } catch (error) {
            console.error('Failed to load user permissions:', error);
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
                    await selectTenant(tenantsArr && tenantsArr.length > 0 ? tenantsArr[0] : null);
                } else {
                    setUser(null);
                    setTenants(null);
                    await selectTenant(null);
                }
            } catch (e) {
                console.log('validateToken error:', e);
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
            loadUserPermissions();
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
        setUserPermissions(null);
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        localStorage.removeItem(CURRENT_TENANT);
    };
    const selectTenant = async (tenant: Tenant | null) => {
        const previousTenantId = currentTenant?.id;
        setCurrentTenant(tenant);
        localStorage.setItem(CURRENT_TENANT, tenant ? tenant.id : '');
        
        // 如果租户发生了变化，清除所有查询缓存以强制刷新页面数据
        if (previousTenantId !== tenant?.id) {
            await queryClient.invalidateQueries();
        }
    };
    
    const hasRole = (role: string): boolean => {
        const hasRoleResult = userPermissions?.roles?.includes(role) ?? false;
        console.log(`Checking role '${role}' for user ${user?.name}:`, hasRoleResult);
        console.log('Current userPermissions:', userPermissions);
        return hasRoleResult;
    };
    
    const isAdmin = (): boolean => hasRole('admin');
    const contextValue = {
        user,
        tenants,
        currentTenant,
        userPermissions,
        login,
        logout,
        selectTenant,
        isLoading,
        hasRole,
        isAdmin,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}
