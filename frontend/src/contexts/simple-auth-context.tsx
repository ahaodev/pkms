import {createContext, useContext, useState, useEffect} from 'react';
import {User, Group, CreateGroupRequest, UpdateGroupRequest} from '@/types/simplified';
import * as authAPI from '@/lib/api/auth';

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
    logout: () => {},
    isLoading: false,
    isAdmin: () => false,
    canAccessProject: () => false,
    getAllUsers: () => [],
    createUser: async () => ({} as User),
    updateUser: async () => ({} as User),
    deleteUser: async () => {},
    assignProjectToUser: async () => {},
    getAllGroups: () => [],
    createGroup: async () => ({} as Group),
    updateGroup: async () => ({} as Group),
    deleteGroup: async () => {},
    addUserToGroup: async () => {},
    removeUserFromGroup: async () => {},
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
            { projectId: '1', canView: true, canEdit: true },
            { projectId: '2', canView: true, canEdit: false }
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
            { projectId: '1', canView: true, canEdit: true },
            { projectId: '3', canView: true, canEdit: true }
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

    useEffect(() => {
        const initializeAuth = async () => {
            console.log('AuthContext: initializing auth...');
            // 检查本地存储中的登录状态和令牌
            const storedUser = localStorage.getItem('pkms_user');
            const accessToken = localStorage.getItem('pkms_access_token');
            
            console.log('AuthContext: stored data check:', { 
                hasStoredUser: !!storedUser, 
                hasAccessToken: !!accessToken 
            });
            
            if (storedUser && accessToken) {
                try {
                    // 先解析并设置存储的用户信息
                    const parsedUser = JSON.parse(storedUser);
                    console.log('AuthContext: setting user from storage:', parsedUser.username);
                    setUser(parsedUser);
                    
                    // 后台验证令牌（不阻塞用户体验）
                    authAPI.validateToken()
                        .then(response => {
                            if (response.code === 0 && response.data) {
                                // 令牌有效，静默更新用户信息
                                console.log('AuthContext: token validation successful');
                                setUser(response.data);
                                localStorage.setItem('pkms_user', JSON.stringify(response.data));
                            } else {
                                console.warn('AuthContext: token validation failed with response:', response);
                            }
                        })
                        .catch(tokenError => {
                            console.warn('Background token validation failed:', tokenError);
                            // 验证失败但不影响当前登录状态
                        });
                        
                } catch (parseError) {
                    console.error('Failed to parse stored user:', parseError);
                    // 解析失败，清除损坏的数据
                    localStorage.removeItem('pkms_user');
                    localStorage.removeItem('pkms_access_token');
                    localStorage.removeItem('pkms_refresh_token');
                }
            } else {
                console.log('AuthContext: no stored auth data found');
            }
            console.log('AuthContext: setting isLoading to false');
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        console.log('AuthContext: starting login for user:', username);
        setIsLoading(true);

        try {
            // 调用真实的 API 接口
            const response = await authAPI.login({ username, password });
            console.log('AuthContext: login API response:', response);
            
            if (response.code === 0 && response.data) {
                const loginData = response.data;
                
                // 先存储令牌
                localStorage.setItem('pkms_access_token', loginData.accessToken);
                localStorage.setItem('pkms_refresh_token', loginData.refreshToken);
                console.log('AuthContext: tokens stored successfully');
                
                // 尝试使用令牌获取用户信息
                try {
                    const userResponse = await authAPI.validateToken();
                    console.log('AuthContext: user validation response:', userResponse);
                    if (userResponse.code === 0 && userResponse.data) {
                        console.log('AuthContext: setting real user data');
                        setUser(userResponse.data);
                        localStorage.setItem('pkms_user', JSON.stringify(userResponse.data));
                    } else {
                        // 如果获取用户信息失败，创建一个临时用户对象
                        console.log('AuthContext: creating temporary user');
                        const tempUser = {
                            id: username, // 使用用户名作为临时ID
                            username: username,
                            email: `${username}@example.com`,
                            avatar: '👤',
                            role: 'user' as const,
                            createdAt: new Date(),
                            isActive: true,
                        };
                        setUser(tempUser);
                        localStorage.setItem('pkms_user', JSON.stringify(tempUser));
                    }
                } catch (userError) {
                    console.warn('Failed to get user info, using temporary user:', userError);
                    // 创建一个临时用户对象
                    const tempUser = {
                        id: username,
                        username: username,
                        email: `${username}@example.com`,
                        avatar: '👤',
                        role: 'user' as const,
                        createdAt: new Date(),
                        isActive: true,
                    };
                    console.log('AuthContext: setting temporary user:', tempUser);
                    setUser(tempUser);
                    localStorage.setItem('pkms_user', JSON.stringify(tempUser));
                }
                
                console.log('AuthContext: login successful, setting isLoading to false');
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
        localStorage.removeItem('pkms_user');
        localStorage.removeItem('pkms_access_token');
        localStorage.removeItem('pkms_refresh_token');
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
            u.id === userId ? { ...u, ...userData } : u
        ));
        
        // 如果更新的是当前用户，也更新 user 状态
        if (user && user.id === userId) {
            const updatedUser = { ...user, ...userData };
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
                ? { ...g, ...groupData, updatedAt: new Date() }
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
                ? { ...g, memberCount: g.memberCount + 1 }
                : g
        ));
    };

    const removeUserFromGroup = async (userId: string, groupId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 更新用户的组信息
        setUsers(prev => prev.map(u => 
            u.id === userId 
                ? { ...u, groupIds: u.groupIds?.filter(gId => gId !== groupId) }
                : u
        ));
        
        // 更新组的成员数量
        setGroups(prev => prev.map(g => 
            g.id === groupId 
                ? { ...g, memberCount: Math.max(0, g.memberCount - 1) }
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
