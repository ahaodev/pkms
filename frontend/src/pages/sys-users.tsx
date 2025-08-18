import {useMemo, useState, useEffect} from 'react';
import {toast} from 'sonner';
import {useAuth} from '@/providers/auth-provider.tsx';
import {useProjects} from '@/hooks/use-projects';
import {useCreateUser, useDeleteUser, useUpdateUser, useUsers} from '@/hooks/use-users';
import {CreateUserRequest, UpdateUserRequest, User} from '@/types/user';
import {UserFilters, UserList} from '@/components/user';
import {UserHeader} from '@/components/user/user-header';
import {UserCreateDialog} from '@/components/user/user-create-dialog';
import {UserEditDialog} from '@/components/user/user-edit-dialog';
import {Page, PageContent} from '@/components/page';
import {useI18n} from '@/contexts/i18n-context';
import {usePagination} from '@/hooks/use-pagination';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

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
    create_tenant: false,
};

export default function UsersPage() {
    const {t} = useI18n();
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

    // 分页状态
    const pagination = usePagination({
        initialPageSize: 20,
        defaultPageSize: 20
    });

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

    // Update pagination total items when filtered users change
    useEffect(() => {
        pagination.setTotalItems(filteredUsers.length);
    }, [filteredUsers.length, pagination]);

    // 获取当前页显示的用户数据
    const paginatedUsers = useMemo(() => {
        return pagination.getPageData(filteredUsers);
    }, [filteredUsers, pagination.currentPage, pagination.pageSize]);


    // 移除这个检查，让 Page 组件处理 loading 状态

    const handleCreateUser = async () => {
        if (!userForm.name || !userForm.password) {
            toast.error(t('user.requiredFieldsError'));
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

            toast.success(t('user.createSuccess', { name: userForm.name }));

            setIsCreateDialogOpen(false);
            resetForm();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('user.createError'));
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setUserForm({
            name: user.name,
            password: '',
            is_active: user.is_active,
            create_tenant: false,
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdateUser = async () => {
        if (!editingUser || !userForm.name) {
            toast.error(t('user.requiredNameError'));
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

            toast.success(t('user.updateSuccess', { name: userForm.name }));

            setIsEditDialogOpen(false);
            setEditingUser(null);
            resetForm();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('user.updateError'));
        }
    };

    const handleDeleteUser = async (user: User) => {
        if (user.id === currentUser?.id) {
            toast.error(t('user.cannotDeleteSelf'));
            return;
        }

        if (!confirm(t('user.deleteConfirm', { name: user.name }))) {
            return;
        }

        try {
            await deleteUserMutation.mutateAsync(user.id);
            toast.success(t('user.deleteSuccess', { name: user.name }));
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('user.deleteError'));
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

            const statusText = user.is_active ? t('user.disabled') : t('user.enabled');
            toast.success(t('user.statusUpdateSuccess', { name: user.name, status: statusText }));
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('user.statusUpdateError'));
        }
    };

    return (
        <Page isLoading={isLoading}>
            {/* 页面头部 */}
            <UserHeader onCreateUser={() => setIsCreateDialogOpen(true)} />

            <PageContent>
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
                    users={paginatedUsers}
                    currentUser={currentUser}
                    projects={projects}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                    onToggleStatus={handleToggleUserStatus}
                />

                {/* 分页组件 */}
                <div className="py-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (pagination.currentPage > 1) {
                                            pagination.setPage(pagination.currentPage - 1);
                                        }
                                    }}
                                    className={pagination.currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                            
                            <PaginationItem>
                                <span className="text-sm text-muted-foreground px-4">
                                    第 {pagination.currentPage} 页，共 {pagination.totalPages} 页 (总数: {pagination.totalItems})
                                </span>
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationNext 
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (pagination.currentPage < pagination.totalPages) {
                                            pagination.setPage(pagination.currentPage + 1);
                                        }
                                    }}
                                    className={pagination.currentPage >= pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>

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
            </PageContent>
        </Page>
    );
}
