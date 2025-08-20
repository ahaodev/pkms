import {useState} from 'react';
import {toast} from 'sonner';
import {useAuth} from '@/providers/auth-provider.tsx';
import {useCreateUser, useDeleteUser, useUpdateUser, useUsersWithPagination} from '@/hooks/use-users';
import {CreateUserRequest, UpdateUserRequest, User} from '@/types/user';
import {UserList} from '@/components/user';
import {UserHeader} from '@/components/user/user-header';
import {UserCreateDialog} from '@/components/user/user-create-dialog';
import {UserEditDialog} from '@/components/user/user-edit-dialog';
import {Page, PageContent} from '@/components/page';
import {useI18n} from '@/contexts/i18n-context';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
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

    // 分页状态
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);
    
    const {data: paginatedData, isLoading} = useUsersWithPagination(currentPage, pageSize);
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();
    const deleteUserMutation = useDeleteUser();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userForm, setUserForm] = useState<UserFormData>(initialFormData);

    // 从分页数据中提取信息
    const users = paginatedData?.list || [];
    const totalUsers = paginatedData?.total || 0;
    const totalPages = paginatedData?.total_pages || 1;

    const updateUserForm = (updates: Partial<UserFormData>) => {
        setUserForm(prev => ({...prev, ...updates}));
    };

    const resetForm = () => {
        setUserForm(initialFormData);
    };


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

            toast.success(t('user.createSuccess', {name: userForm.name}));

            setIsCreateDialogOpen(false);
            resetForm();
            setCurrentPage(1); // Reset to first page
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

            toast.success(t('user.updateSuccess', {name: userForm.name}));

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

        if (!confirm(t('user.deleteConfirm', {name: user.name}))) {
            return;
        }

        try {
            await deleteUserMutation.mutateAsync(user.id);
            toast.success(t('user.deleteSuccess', {name: user.name}));
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
            toast.success(t('user.statusUpdateSuccess', {name: user.name, status: statusText}));
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('user.statusUpdateError'));
        }
    };

    return (
        <Page isLoading={isLoading}>
            {/* 页面头部 */}
            <UserHeader onCreateUser={() => setIsCreateDialogOpen(true)}/>

            <PageContent>
                {/* 统计信息 */}
                <div className="mb-6">
                    <div className="text-sm text-muted-foreground">
                        总数: {totalUsers}
                    </div>
                </div>

                {/* 用户列表 */}
                <UserList
                    users={users}
                    currentUser={currentUser}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                    onToggleStatus={handleToggleUserStatus}
                />

                {/* 分页组件 - 仅在总页数超过1页时显示 */}
                {totalPages > 1 && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage > 1) {
                                            setCurrentPage(currentPage - 1);
                                        }
                                    }}
                                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>

                            <PaginationItem>
                                <span className="text-sm text-muted-foreground px-4">
                                    第 {currentPage} 页，共 {totalPages} 页 (总数: {totalUsers})
                                </span>
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage < totalPages) {
                                            setCurrentPage(currentPage + 1);
                                        }
                                    }}
                                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}

                {/* 创建用户对话框 */}
                <UserCreateDialog
                    open={isCreateDialogOpen}
                    onClose={() => {
                        setIsCreateDialogOpen(false);
                        resetForm();
                    }}
                    onSubmit={handleCreateUser}
                    userForm={userForm}
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
                    groups={[]}
                    updateUserForm={updateUserForm}
                />
            </PageContent>
        </Page>
    );
}
