import {createContext, useContext, useEffect, useState} from 'react';
import {CreateGroupRequest, Group, UpdateGroupRequest, User} from '@/types/simplified';
import * as authAPI from '@/lib/api/auth';
import {ACCESS_TOKEN, REFRESH_TOKEN} from "@/types/constants.ts";
import {jwtDecode} from "jwt-decode";

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
    isAdmin: () => boolean;
    canAccessProject: (projectId: string) => boolean;
    getAllUsers: () => User[];
    createUser: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<User>;
    updateUser: (userId: string, userData: Partial<User>) => Promise<User>;
    deleteUser: (userId: string) => Promise<void>;
    assignProjectToUser: (userId: string, projectId: string) => Promise<void>;
    // 组管理方法
    getAllGroups: () => Group[];
    createGroup: (groupData: CreateGroupRequest) => Promise<Group>;
    updateGroup: (groupId: string, groupData: UpdateGroupRequest) => Promise<Group>;
    deleteGroup: (groupId: string) => Promise<void>;
    addUserToGroup: (userId: string, groupId: string) => Promise<void>;
    removeUserFromGroup: (userId: string, groupId: string) => Promise<void>;
    getUserGroups: (userId: string) => Group[];
    getGroupMembers: (groupId: string) => User[];
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function parseUser(token: string | null): User | null {
    if (!token) return null;
    type CustomJwtPayload = {
        id: string;
        name: string;
        email: string;
        avatar: string;
        role?: string;
        createdAt?: string;
        isActive?: boolean;
    };
    const jwt = jwtDecode<CustomJwtPayload>(token);
    if (!jwt.id || !jwt.name || !jwt.email || !jwt.avatar) return null;
    return {
        id: jwt.id,
        username: jwt.name,
        email: jwt.email,
        avatar: jwt.avatar,
        role: (jwt.role as User['role']) ?? 'user',
        createdAt: jwt.createdAt ? new Date(jwt.createdAt) : new Date(),
        isActive: jwt.isActive ?? true,
    };
}

const mockGroups: Group[] = [/* ... */];
const mockUsers: User[] = [/* ... */];

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: async () => false,
    logout: () => {
    },
    isLoading: false,
    isAdmin: () => false,
    canAccessProject: () => false,
    getAllUsers: () => [],
    createUser: async () => ({} as User),
    updateUser: async () => ({} as User),
    deleteUser: async () => {
    },
    assignProjectToUser: async () => {
    },
    getAllGroups: () => [],
    createGroup: async () => ({} as Group),
    updateGroup: async () => ({} as Group),
    deleteGroup: async () => {
    },
    addUserToGroup: async () => {
    },
    removeUserFromGroup: async () => {
    },
    getUserGroups: () => [],
    getGroupMembers: () => [],
});

export const useAuth = () => useContext(AuthContext);

export function AuthContextProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [groups, setGroups] = useState<Group[]>(mockGroups);
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
                                    setUser(response.data);
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
                    setUser(userResponse.data);
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

    const isAdmin = (): boolean => user?.role === 'admin';

    const canAccessProject = (projectId: string): boolean => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        if (user.assignedProjectIds?.includes(projectId)) return true;
        const userGroups = getUserGroups(user.id);
        return userGroups.some(group =>
            group.permissions.some(p => p.projectId === projectId && p.canView)
        );
    };

    const getAllUsers = (): User[] => users;

    const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
        await delay(500);
        const newUser: User = {
            ...userData,
            id: Date.now().toString(),
            createdAt: new Date(),
        };
        setUsers(prev => [...prev, newUser]);
        return newUser;
    };

    const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
        await delay(500);
        let updatedUser: User | undefined;
        setUsers(prev => {
            const next = prev.map(u => {
                if (u.id === userId) {
                    updatedUser = {...u, ...userData};
                    return updatedUser;
                }
                return u;
            });
            return next;
        });
        if (user && user.id === userId && updatedUser) {
            setUser(updatedUser);
        }
        return updatedUser!;
    };

    const deleteUser = async (userId: string): Promise<void> => {
        await delay(500);
        setUsers(prev => prev.filter(u => u.id !== userId));
        setGroups(prev => prev.map(g => ({
            ...g,
            memberCount: Math.max(0, g.memberCount - (users.find(u => u.id === userId)?.groupIds?.includes(g.id) ? 1 : 0))
        })));
    };

    const assignProjectToUser = async (userId: string, projectId: string): Promise<void> => {
        await delay(500);
        setUsers(prev => prev.map(u =>
            u.id === userId
                ? {
                    ...u,
                    assignedProjectIds: [...(u.assignedProjectIds || []), projectId]
                        .filter((id, idx, arr) => arr.indexOf(id) === idx)
                }
                : u
        ));
    };

    const getAllGroups = (): Group[] => groups;

    const createGroup = async (groupData: CreateGroupRequest): Promise<Group> => {
        await delay(500);
        const newGroup: Group = {
            ...groupData,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
            memberCount: 0,
            createdBy: user?.id || '1',
            permissions: groupData.permissions || []
        };
        setGroups(prev => [...prev, newGroup]);
        return newGroup;
    };

    const updateGroup = async (groupId: string, groupData: UpdateGroupRequest): Promise<Group> => {
        await delay(500);
        let updatedGroup: Group | undefined;
        setGroups(prev => {
            const next = prev.map(g => {
                if (g.id === groupId) {
                    updatedGroup = {...g, ...groupData, updatedAt: new Date()};
                    return updatedGroup;
                }
                return g;
            });
            return next;
        });
        return updatedGroup!;
    };

    const deleteGroup = async (groupId: string): Promise<void> => {
        await delay(500);
        setUsers(prev => prev.map(u => ({
            ...u,
            groupIds: u.groupIds?.filter(gId => gId !== groupId)
        })));
        setGroups(prev => prev.filter(g => g.id !== groupId));
    };

    const addUserToGroup = async (userId: string, groupId: string): Promise<void> => {
        await delay(500);
        setUsers(prev => prev.map(u =>
            u.id === userId
                ? {
                    ...u,
                    groupIds: [...(u.groupIds || []), groupId]
                        .filter((id, idx, arr) => arr.indexOf(id) === idx)
                }
                : u
        ));
        setGroups(prev => prev.map(g =>
            g.id === groupId
                ? {...g, memberCount: g.memberCount + 1}
                : g
        ));
    };

    const removeUserFromGroup = async (userId: string, groupId: string): Promise<void> => {
        await delay(500);
        setUsers(prev => prev.map(u =>
            u.id === userId
                ? {...u, groupIds: u.groupIds?.filter(gId => gId !== groupId)}
                : u
        ));
        setGroups(prev => prev.map(g =>
            g.id === groupId
                ? {...g, memberCount: Math.max(0, g.memberCount - 1)}
                : g
        ));
    };

    const getUserGroups = (userId: string): Group[] => {
        const foundUser = users.find(u => u.id === userId);
        if (!foundUser || !foundUser.groupIds) return [];
        return groups.filter(g => foundUser.groupIds!.includes(g.id));
    };

    const getGroupMembers = (groupId: string): User[] => {
        return users.filter(u => u.groupIds?.includes(groupId));
    };

    const contextValue = {
        user,
        login,
        logout,
        isLoading,
        isAdmin,
        canAccessProject,
        getAllUsers,
        createUser,
        updateUser,
        deleteUser,
        assignProjectToUser,
        getAllGroups,
        createGroup,
        updateGroup,
        deleteGroup,
        addUserToGroup,
        removeUserFromGroup,
        getUserGroups,
        getGroupMembers,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}