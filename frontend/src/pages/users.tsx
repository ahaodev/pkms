import {useCallback, useMemo, useState} from 'react';
import {Shield} from 'lucide-react';
import {toast} from 'sonner';
import {useAuth} from '@/providers/auth-provider.tsx';
import {useProjects} from '@/hooks/use-projects';
import {useCreateUser, useDeleteUser, useUpdateUser, useUsers} from '@/hooks/use-users';
import {CreateUserRequest, UpdateUserRequest, User, UserRole} from '@/types/user';
import {Group} from '@/types/group';
import {UserFilters, UserList} from '@/components/user';
import { UserHeader } from '@/components/user/user-header';
import { UserCreateDialog } from '@/components/user/user-create-dialog';
import { UserEditDialog } from '@/components/user/user-edit-dialog';

/**
 * 用户管理页面：管理系统用户，分配项目权限
 */

interface UserFormData {
    name: string;
    password: string;
    is_active: boolean;
}

export default function UsersPage() {
    const {user: currentUser, hasRole} = useAuth();
    const {data: projects} = useProjects();

    const {data: users, isLoading} = useUsers();
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();
    const deleteUserMutation = useDeleteUser();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

    const [userForm, setUserForm] = useState<UserFormData>({
        name: '',
        password: '',
        is_active: true,
    });

    // 表单状态更新函数
    const updateUserForm = useCallback((updates: Partial<UserFormData>) => {
        setUserForm(prev => ({...prev, ...updates}));
    }, []);

    // 重置表单
    const resetForm = useCallback(() => {
        setUserForm({
            name: '',
            password: '',
            is_active: true,
        });
    }, []);

    // 过滤用户
    const filteredUsers = useMemo(() => {
        if (!users) return [];
        return users.filter((user: User) => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all';
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

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

    const groups = getAllGroups();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
                </div>
            </div>
        );
    }

    // 检查权限 - 只有管理员可以访问
    if (!hasRole('admin')) {
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
        if (!userForm.name || !userForm.password) {
            toast.error('请填写必填字段：用户名和密码为必填项');
            return;
        }

        try {
            const createRequest: CreateUserRequest = {
                name: userForm.name,
                password: userForm.password,
                is_active: userForm.is_active,
            };

            await createUserMutation.mutateAsync(createRequest);

            toast.success(`用户 "${userForm.name}" 已创建`);

            setIsCreateDialogOpen(false);
            resetForm();
        } catch (error: any) {
            toast.error(error.response?.data?.message || '用户创建失败，请重试');
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setUserForm({
            name: user.name,
            password: '',
            is_active: user.is_active,
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdateUser = async () => {
        if (!editingUser || !userForm.name) {
            toast.error('请填写必填字段：用户名为必填项');
            return;
        }

        try {
            const updateRequest: UpdateUserRequest = {
                name: userForm.name,
                is_active: userForm.is_active,
            };

            await updateUserMutation.mutateAsync({
                id: editingUser.id,
                update: updateRequest
            });

            toast.success(`用户 "${userForm.name}" 已更新`);

            setIsEditDialogOpen(false);
            setEditingUser(null);
            resetForm();
        } catch (error: any) {
            toast.error(error.response?.data?.message || '用户更新失败，请重试');
        }
    };

    const handleDeleteUser = async (user: User) => {
        if (user.id === currentUser?.id) {
            toast.error('不能删除自己：您不能删除自己的账户');
            return;
        }

        if (!confirm(`确定要删除用户 "${user.name}" 吗？此操作无法撤销。`)) {
            return;
        }

        try {
            await deleteUserMutation.mutateAsync(user.id);
            toast.success(`用户 "${user.name}" 已删除`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || '用户删除失败，请重试');
        }
    };

    const handleToggleUserStatus = async (user: User) => {
        try {
            const updateRequest: UpdateUserRequest = {
                is_active: !user.is_active,
            };

            await updateUserMutation.mutateAsync({
                id: user.id,
                update: updateRequest
            });

            toast.success(`用户 "${user.name}" 已${user.is_active ? '禁用' : '启用'}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || '用户状态更新失败，请重试');
        }
    };

    return (
        <div className="space-y-6">
            {/* 页面头部 */}
            <UserHeader onCreateUser={() => setIsCreateDialogOpen(true)} />

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
            <UserCreateDialog
                open={isCreateDialogOpen}
                onClose={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                }}
                onSubmit={handleCreateUser}
                userForm={userForm}
                projects={projects}
                groups={groups}
                updateUserForm={updateUserForm}
            />

            {/* 编辑用户对话框 */}
            <UserEditDialog
                open={isEditDialogOpen}
                onClose={() => {
                    setIsEditDialogOpen(false);
                    setEditingUser(null);
                    resetForm();
                }}
                onSubmit={handleUpdateUser}
                userForm={userForm}
                projects={projects}
                groups={groups}
                updateUserForm={updateUserForm}
            />
        </div>
    );
}
