import {useCallback, useMemo, useState} from 'react';
import {Shield} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import {useAuth} from '@/contexts/auth-context.tsx';
import {useProjects} from '@/hooks/use-projects';
import {User, UserRole, Group} from '@/types/simplified';
import {UserDialog, UserFilters, UserHeader, UserList} from '@/components/user';

/**
 * 用户管理页面：管理系统用户，分配项目权限
 */

interface UserFormData {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    assignedProjectIds: string[];
    groupIds: string[];
    isActive: boolean;
}

export default function UsersPage() {
    const {toast} = useToast();
    const {user: currentUser, isAdmin} = useAuth();
    const {data: projects} = useProjects();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

    const [userForm, setUserForm] = useState<UserFormData>({
        username: '',
        email: '',
        password: '',
        role: 'user',
        assignedProjectIds: [],
        groupIds: [],
        isActive: true,
    });
    const getAllGroups = (): Group[] => [
        {
            id: 'g1',
            name: '开发组',
            description: '开发相关成员',
            color: '#2196f3',
            createdAt: new Date(),
            updatedAt: new Date(),
            memberCount: 5,
            createdBy: 'u1',
            permissions: [],
        },
        {
            id: 'g2',
            name: '测试组',
            description: '测试相关成员',
            color: '#4caf50',
            createdAt: new Date(),
            updatedAt: new Date(),
            memberCount: 3,
            createdBy: 'u2',
            permissions: [],
        },
    ];

    const getAllUsers = (): User[] => [
        {
            id: 'u1',
            username: 'admin',
            email: 'admin@example.com',
            isActive: true,
            createdAt: new Date(),
        },
        {
            id: 'u2',
            username: 'test',
            email: 'test@example.com',
            createdAt: new Date(),
            isActive: true,
        },
    ];
    const createUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
        console.log(userData);
    }
    const updateUser = async (id: string, updates: Partial<User>) => {
        console.log(id, updates);
    }

    const deleteUser = async (id: string) => {
        console.log(id);
    }


    // 只保留一次声明
    const users = getAllUsers();
    const groups = getAllGroups();

    // 表单状态更新函数
    const updateUserForm = useCallback((updates: Partial<UserFormData>) => {
        setUserForm(prev => ({...prev, ...updates}));
    }, []);

    // 重置表单
    const resetForm = useCallback(() => {
        setUserForm({
            username: '',
            email: '',
            password: '',
            role: 'user',
            assignedProjectIds: [],
            groupIds: [],
            isActive: true,
        });
    }, []);

    // 过滤用户
    const filteredUsers = useMemo(() => {
        return users.filter((user: User) => {
            const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all';
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    // 检查权限 - 只有管理员可以访问
    if (!isAdmin()) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Shield className="mx-auto h-12 w-12 text-muted-foreground"/>
                    <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
                        访问被拒绝
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        您没有权限访问用户管理页面
                    </p>
                </div>
            </div>
        );
    }

    const handleCreateUser = async () => {
        if (!userForm.username || !userForm.email || !userForm.password) {
            toast({
                variant: 'destructive',
                title: '请填写必填字段',
                description: '用户名、邮箱和密码为必填项。',
            });
            return;
        }

        try {
            await createUser({
                username: userForm.username,
                email: userForm.email,
                isActive: userForm.isActive,
            });

            toast({
                title: '用户创建成功',
                description: `用户 "${userForm.username}" 已创建。`,
            });

            setIsCreateDialogOpen(false);
            resetForm();
        } catch {
            toast({
                variant: 'destructive',
                title: '创建失败',
                description: '用户创建失败，请重试。',
            });
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setUserForm({
            username: user.username,
            email: user.email,
            password: '',
            role: 'user',
            assignedProjectIds: [],
            groupIds: [],
            isActive: user.isActive,
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdateUser = async () => {
        if (!editingUser || !userForm.username || !userForm.email) {
            toast({
                variant: 'destructive',
                title: '请填写必填字段',
                description: '用户名和邮箱为必填项。',
            });
            return;
        }

        try {
            await updateUser(editingUser.id, {
                username: userForm.username,
                email: userForm.email,
                isActive: userForm.isActive,
            });

            toast({
                title: '用户更新成功',
                description: `用户 "${userForm.username}" 已更新。`,
            });

            setIsEditDialogOpen(false);
            setEditingUser(null);
            resetForm();
        } catch {
            toast({
                variant: 'destructive',
                title: '更新失败',
                description: '用户更新失败，请重试。',
            });
        }
    };

    const handleDeleteUser = async (user: User) => {
        if (user.id === currentUser?.id) {
            toast({
                variant: 'destructive',
                title: '不能删除自己',
                description: '您不能删除自己的账户。',
            });
            return;
        }

        if (!confirm(`确定要删除用户 "${user.username}" 吗？此操作无法撤销。`)) {
            return;
        }

        try {
            await deleteUser(user.id);
            toast({
                title: '用户删除成功',
                description: `用户 "${user.username}" 已删除。`,
            });
        } catch {
            toast({
                variant: 'destructive',
                title: '删除失败',
                description: '用户删除失败，请重试。',
            });
        }
    };

    const handleToggleUserStatus = async (user: User) => {
        try {
            await updateUser(user.id, {isActive: !user.isActive});
            toast({
                title: user.isActive ? '用户已禁用' : '用户已启用',
                description: `用户 "${user.username}" 已${user.isActive ? '禁用' : '启用'}。`,
            });
        } catch {
            toast({
                variant: 'destructive',
                title: '操作失败',
                description: '用户状态更新失败，请重试。',
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* 页面头部 */}
            <UserHeader onCreateUser={() => setIsCreateDialogOpen(true)}/>

            {/* 筛选器 */}
            <UserFilters
                searchTerm={searchTerm}
                roleFilter={roleFilter}
                totalUsers={filteredUsers.length}
                onSearchChange={setSearchTerm}
                onRoleFilterChange={setRoleFilter}
            />

            {/* 用户列表 */}
            <UserList
                users={filteredUsers}
                currentUser={currentUser}
                projects={projects}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onToggleStatus={handleToggleUserStatus}
            />

            {/* 创建用户对话框 */}
            <UserDialog
                open={isCreateDialogOpen}
                onClose={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                }}
                onSubmit={handleCreateUser}
                title="创建新用户"
                userForm={userForm}
                projects={projects}
                groups={groups}
                updateUserForm={updateUserForm}
            />

            {/* 编辑用户对话框 */}
            <UserDialog
                open={isEditDialogOpen}
                onClose={() => {
                    setIsEditDialogOpen(false);
                    setEditingUser(null);
                    resetForm();
                }}
                onSubmit={handleUpdateUser}
                title="编辑用户"
                isEdit={true}
                userForm={userForm}
                projects={projects}
                groups={groups}
                updateUserForm={updateUserForm}
            />
        </div>
    );
}
