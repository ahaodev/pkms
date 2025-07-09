import {createContext, useContext, useState, useEffect} from 'react';
import {User, Group, CreateGroupRequest, UpdateGroupRequest} from '@/types/simplified';

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

export function AuthProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [groups, setGroups] = useState<Group[]>(mockGroups);

    useEffect(() => {
        // 检查本地存储中的登录状态
        const storedUser = localStorage.getItem('pkms_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // 从最新的用户列表中找到对应用户
                const currentUser = mockUsers.find(u => u.id === parsedUser.id);
                if (currentUser && currentUser.isActive) {
                    setUser(currentUser);
                } else {
                    localStorage.removeItem('pkms_user');
                }
            } catch {
                localStorage.removeItem('pkms_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        setIsLoading(true);

        // 模拟登录验证
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 查找用户
        const foundUser = users.find(u => u.username === username && u.isActive);
        
        if (foundUser) {
            // 模拟密码验证（实际应用中应该进行加密验证）
            const isValidPassword = password === 'password' || 
                                   (foundUser.username === 'admin' && password === 'admin');
            
            if (isValidPassword) {
                setUser(foundUser);
                localStorage.setItem('pkms_user', JSON.stringify(foundUser));
                setIsLoading(false);
                return true;
            }
        }
        
        setIsLoading(false);
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('pkms_user');
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
