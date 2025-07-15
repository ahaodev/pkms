import {createContext, useContext, useEffect, useState} from 'react';
import {CreateGroupRequest, Group, UpdateGroupRequest, User} from '@/types/simplified';
import * as authAPI from '@/lib/api/auth';
import {ACCESS_TOKEN, REFRESH_TOKEN, USER} from "@/types/constants.ts";
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

// 模拟组数据
const mockGroups: Group[] = [
    {
        id: '1',
        name: '前端开发组',
        description: '负责前端项目开发和维护',
        color: '#3b82f6',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        memberCount: 1,
        createdBy: '1',
        permissions: [
            {projectId: '1', canView: true, canEdit: true},
            {projectId: '2', canView: true, canEdit: false}
        ]
    },
    {
        id: '2',
        name: '后端开发组',
        description: '负责后端服务开发和API设计',
        color: '#10b981',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        memberCount: 2,
        createdBy: '1',
        permissions: [
            {projectId: '1', canView: true, canEdit: true},
            {projectId: '3', canView: true, canEdit: true}
        ]
    }
];

// 模拟用户数据
const mockUsers: User[] = [
    {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        avatar: '👤',
        role: 'admin',
        createdAt: new Date('2024-01-01'),
        isActive: true,
    },
    {
        id: '2',
        username: 'user1',
        email: 'user1@example.com',
        avatar: '👨',
        role: 'user',
        createdAt: new Date('2024-01-02'),
        isActive: true,
        assignedProjectIds: ['1', '2'], // 被分配的项目
        groupIds: ['1'], // 所属组
    },
    {
        id: '3',
        username: 'user2',
        email: 'user2@example.com',
        avatar: '👩',
        role: 'user',
        createdAt: new Date('2024-01-03'),
        isActive: true,
        assignedProjectIds: ['1'], // 被分配的项目
        groupIds: ['2'], // 所属组
    },
];

export function AuthContextProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [groups, setGroups] = useState<Group[]>(mockGroups);
    const [isValidatingToken, setIsValidatingToken] = useState(false);
    function paseUser(token: string | null): User | null {
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
            role: (jwt.role as User['role']) ?? 'user', // 默认角色为 'user'
            createdAt: jwt.createdAt ? new Date(jwt.createdAt) : new Date(),
            isActive: jwt.isActive ?? true,
        };
    }
    useEffect(() => {
        const initializeAuth = async () => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            const storedUser =  paseUser(accessToken);
            console.log(storedUser);
            if (storedUser) {
                try {
                    setUser(storedUser);
                    // 如果有访问令牌，尝试验证（但不影响用户状态）
                    if (accessToken && !isValidatingToken) {
                        setIsValidatingToken(true);
                        console.log('AuthContext: starting background token validation, token preview:', accessToken.substring(0, 20) + '...');

                        // 延迟验证，让用户先进入主页
                        setTimeout(() => {
                            // 后台验证令牌（不阻塞用户体验）
                            authAPI.validateToken()
                                .then(response => {
                                    console.log('AuthContext: token validation response:', response);
                                    if (response.code === 0 && response.data) {
                                        // 令牌有效，静默更新用户信息
                                        setUser(response.data);localStorage.setItem(USER, JSON.stringify(response.data));
                                    } else {
                                        console.warn('AuthContext: token validation failed with response:', response);
                                        // 验证失败但保持当前用户状态
                                    }
                                })
                                .catch(tokenError => {
                                    console.warn('AuthContext: background token validation failed:', tokenError);
                                })
                                .finally(() => {
                                    setIsValidatingToken(false);
                                });
                        }, 500); // 延迟500ms进行验证
                    } else {
                        console.log('AuthContext: no access token or already validating, keeping user logged in');
                    }

                } catch (parseError) {
                    console.error('Failed to parse stored user:', parseError);
                    // 解析失败，清除损坏的数据
                    localStorage.removeItem(USER);
                    localStorage.removeItem(ACCESS_TOKEN);
                    localStorage.removeItem(REFRESH_TOKEN);
                }
            } else {
                console.log('AuthContext: no stored auth data found');
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const login = async (username: string, password: string): Promise<boolean> => {
        console.log('AuthContext: starting login for user:', username);
        setIsLoading(true);

        try {
            const response = await authAPI.login({username, password});
            console.log('AuthContext: login API response:', response);

            if (response.code === 0 && response.data) {
                const loginData = response.data;

                // 先存储令牌
                localStorage.setItem(ACCESS_TOKEN, loginData.accessToken);
                localStorage.setItem(REFRESH_TOKEN, loginData.refreshToken);
                // 尝试使用令牌获取用户信息
                try {
                    const userResponse = await authAPI.validateToken();
                    if (userResponse.code === 0 && userResponse.data) {
                        setUser(userResponse.data);
                        localStorage.setItem(USER, JSON.stringify(userResponse.data));
                    }
                } catch (userError) {
                    console.warn('Failed to get user info, using temporary user:', userError);
                }
                setIsLoading(false);
                return true;
            } else {
                console.log('AuthContext: login failed - invalid response');
                setIsLoading(false);
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            setIsLoading(false);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(USER);
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
    };

    const isAdmin = (): boolean => {
        return user?.role === 'admin';
    };

    const canAccessProject = (projectId: string): boolean => {
        if (!user) return false;
        if (user.role === 'admin') return true;

        // 检查直接分配的项目权限
        if (user.assignedProjectIds?.includes(projectId)) return true;

        // 检查通过组获得的项目权限
        const userGroups = getUserGroups(user.id);
        return userGroups.some(group =>
            group.permissions.some(p => p.projectId === projectId && p.canView)
        );
    };

    const getAllUsers = (): User[] => {
        return users;
    };

    const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        const newUser: User = {
            ...userData,
            id: Date.now().toString(),
            createdAt: new Date(),
        };

        setUsers(prev => [...prev, newUser]);
        return newUser;
    };

    const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        setUsers(prev => prev.map(u =>
            u.id === userId ? {...u, ...userData} : u
        ));

        // 如果更新的是当前用户，也更新 user 状态
        if (user && user.id === userId) {
            const updatedUser = {...user, ...userData};
            setUser(updatedUser);
            localStorage.setItem('pkms_user', JSON.stringify(updatedUser));
        }

        const updatedUser = users.find(u => u.id === userId);
        return updatedUser!;
    };

    const deleteUser = async (userId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        setUsers(prev => prev.filter(u => u.id !== userId));

        // 从所有组中移除该用户
        setGroups(prev => prev.map(g => ({
            ...g,
            memberCount: Math.max(0, g.memberCount - (users.find(u => u.id === userId)?.groupIds?.includes(g.id) ? 1 : 0))
        })));
    };

    const assignProjectToUser = async (userId: string, projectId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        setUsers(prev => prev.map(u =>
            u.id === userId
                ? {
                    ...u,
                    assignedProjectIds: [...(u.assignedProjectIds || []), projectId]
                        .filter((id, index, arr) => arr.indexOf(id) === index) // 去重
                }
                : u
        ));
    };

    // 组管理方法
    const getAllGroups = (): Group[] => {
        return groups;
    };

    const createGroup = async (groupData: CreateGroupRequest): Promise<Group> => {
        await new Promise(resolve => setTimeout(resolve, 500));

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
        await new Promise(resolve => setTimeout(resolve, 500));

        setGroups(prev => prev.map(g =>
            g.id === groupId
                ? {...g, ...groupData, updatedAt: new Date()}
                : g
        ));

        const updatedGroup = groups.find(g => g.id === groupId);
        return updatedGroup!;
    };

    const deleteGroup = async (groupId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        // 从所有用户中移除该组
        setUsers(prev => prev.map(u => ({
            ...u,
            groupIds: u.groupIds?.filter(gId => gId !== groupId)
        })));

        setGroups(prev => prev.filter(g => g.id !== groupId));
    };

    const addUserToGroup = async (userId: string, groupId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        // 更新用户的组信息
        setUsers(prev => prev.map(u =>
            u.id === userId
                ? {
                    ...u,
                    groupIds: [...(u.groupIds || []), groupId]
                        .filter((id, index, arr) => arr.indexOf(id) === index) // 去重
                }
                : u
        ));

        // 更新组的成员数量
        setGroups(prev => prev.map(g =>
            g.id === groupId
                ? {...g, memberCount: g.memberCount + 1}
                : g
        ));
    };

    const removeUserFromGroup = async (userId: string, groupId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        // 更新用户的组信息
        setUsers(prev => prev.map(u =>
            u.id === userId
                ? {...u, groupIds: u.groupIds?.filter(gId => gId !== groupId)}
                : u
        ));

        // 更新组的成员数量
        setGroups(prev => prev.map(g =>
            g.id === groupId
                ? {...g, memberCount: Math.max(0, g.memberCount - 1)}
                : g
        ));
    };

    const getUserGroups = (userId: string): Group[] => {
        const user = users.find(u => u.id === userId);
        if (!user || !user.groupIds) return [];

        return groups.filter(g => user.groupIds!.includes(g.id));
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
