import {useMemo, useState} from 'react';
import {toast} from 'sonner';
import {useAuth} from '@/providers/auth-provider.tsx';
import {useProjects} from '@/hooks/use-projects';
import {useCreateUser, useDeleteUser, useUpdateUser, useUsers} from '@/hooks/use-users';
import {CreateUserRequest, UpdateUserRequest, User} from '@/types/user';
import {UserFilters, UserList} from '@/components/user';
import {UserHeader} from '@/components/user/user-header';
import {UserCreateDialog} from '@/components/user/user-create-dialog';
import {UserEditDialog} from '@/components/user/user-edit-dialog';
import {CustomSkeleton} from '@/components/custom-skeleton';

interface UserFormData {
    name: string;
    password: string;
    is_active: boolean;
    create_tenant: boolean;
}

const initialFormData: UserFormData = {
    name: '',
    password: '',
    is_active: true,
    create_tenant: true, // 默认选中创建租户
};

export default function UsersPage() {
    const {user: currentUser} = useAuth();
    const {data: projects} = useProjects();
    const {data: users, isLoading} = useUsers();
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();
    const deleteUserMutation = useDeleteUser();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [userForm, setUserForm] = useState<UserFormData>(initialFormData);

    const updateUserForm = (updates: Partial<UserFormData>) => {
        setUserForm(prev => ({...prev, ...updates}));
    };

    const resetForm = () => {
        setUserForm(initialFormData);
    };

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        return users.filter((user: User) => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);


    if (isLoading) {
        return (
            <div className="space-y-6">
                <UserHeader onCreateUser={() => setIsCreateDialogOpen(true)} />
                <UserFilters
                    searchTerm=""
                    roleFilter="all"
                    totalUsers={0}
                    onSearchChange={() => {}}
                    onRoleFilterChange={() => {}}
                />
                <CustomSkeleton type="table" rows={6} columns={6} />
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
                create_tenant: userForm.create_tenant,
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
            create_tenant: false, // 编辑时不显示此选项
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
                roleFilter="all"
                totalUsers={filteredUsers.length}
                onSearchChange={setSearchTerm}
                onRoleFilterChange={() => {}}
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
                groups={[]}
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
                groups={[]}
                updateUserForm={updateUserForm}
            />
        </div>
    );
}
