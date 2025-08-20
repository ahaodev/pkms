import {useCallback, useEffect, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {CreateUpgradeTargetDialog, EditUpgradeTargetDialog, UpgradeTargetsTable} from '@/components/upgrade';
import {ProjectPackageFilters} from '@/components/project-package-filters';
import {toast} from 'sonner';
import {useAllProjects} from '@/hooks/use-projects';
import {usePackages} from '@/hooks/use-packages';
import {
    createUpgradeTarget,
    CreateUpgradeTargetRequest,
    getUpgradeTargets,
    updateUpgradeTarget,
    UpdateUpgradeTargetRequest,
    UpgradeTarget
} from '@/lib/api/upgrade';
import {Page, PageHeader, PageContent} from "@/components/page";
import {Plus} from "lucide-react";
import {useI18n} from '@/contexts/i18n-context';
import {usePagination} from '@/hooks/use-pagination';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

export default function UpgradePage() {
    const {t} = useI18n();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedTarget, setSelectedTarget] = useState<UpgradeTarget | null>(null);
    const [formData, setFormData] = useState<CreateUpgradeTargetRequest>({
        project_id: '',
        package_id: '',
        release_id: '',
        name: '',
        description: ''
    });
    const [editFormData, setEditFormData] = useState<UpdateUpgradeTargetRequest>({});

    // Filter states
    const [projectFilter, setProjectFilter] = useState<string>('all');
    const [packageFilter, setPackageFilter] = useState<string>('all');

    const queryClient = useQueryClient();

    // 分页状态
    const pagination = usePagination({
        initialPageSize: 20,
        defaultPageSize: 20
    });

    // Fetch data
    const {data: projects = []} = useAllProjects();
    const {data: packagesData} = usePackages();
    const packages = packagesData?.data || [];


    // Fetch upgrade targets with pagination
    const {data: upgradeTargetsData, isLoading, error} = useQuery({
        queryKey: ['upgrade-targets', pagination.currentPage, pagination.pageSize, projectFilter, packageFilter],
        queryFn: async () => {
            const filters: any = {
                page: pagination.currentPage,
                pageSize: pagination.pageSize
            };
            
            if (projectFilter !== 'all') {
                filters.project_id = projectFilter;
            }
            if (packageFilter !== 'all') {
                filters.package_id = packageFilter;
            }
            
            return await getUpgradeTargets(filters);
        },
    });

    // Handle query error
    useEffect(() => {
        if (error) {
            console.error(error);
            const errorMessage = (error as any)?.response?.data?.msg || (error as any)?.message || t('upgrade.fetchError');
            toast.error(errorMessage);
        }
    }, [error]);

    // 从分页响应中获取数据
    const upgradeTargets: UpgradeTarget[] = upgradeTargetsData?.data.list || [];
    const totalTargets = upgradeTargetsData?.data.total || 0;
    const totalPages = upgradeTargetsData?.data.total_pages || 0;

    // Update pagination total items when API response changes
    useEffect(() => {
        if (upgradeTargetsData) {
            pagination.setTotalItems(upgradeTargetsData.data.total);
        }
    }, [upgradeTargetsData, pagination]);

    // Reset package filter when project filter changes
    useEffect(() => {
        if (projectFilter !== 'all') {
            setPackageFilter('all');
        }
    }, [projectFilter]);

    // Create upgrade target mutation
    const createUpgradeTargetMutation = useMutation({
        mutationFn: createUpgradeTarget,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['upgrade-targets']});
            setIsCreateDialogOpen(false);
            resetForm();
            toast.success(t('upgrade.createSuccess'));
        },
        onError: (err: any) => {
            console.error(err);
            const errorMessage = err?.response?.data?.msg || err?.message || t('upgrade.createError');
            toast.error(errorMessage);
        }
    });

    // Update upgrade target mutation
    const updateUpgradeTargetMutation = useMutation({
        mutationFn: ({id, data}: { id: string, data: UpdateUpgradeTargetRequest }) =>
            updateUpgradeTarget(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['upgrade-targets']});
            setIsEditDialogOpen(false);
            setSelectedTarget(null);
            resetEditForm();
            toast.success(t('upgrade.updateSuccess'));
        },
        onError: (error: any) => {
            console.error(error);
            const errorMessage = error?.response?.data?.msg || error?.message || t('upgrade.updateError');
            toast.error(errorMessage);
        }
    });

    const resetForm = useCallback(() => {
        setFormData({
            project_id: '',
            package_id: '',
            release_id: '',
            name: '',
            description: ''
        });
    }, []);

    const resetEditForm = useCallback(() => {
        setEditFormData({});
    }, []);

    const handleCreate = useCallback(() => {
        createUpgradeTargetMutation.mutate(formData);
    }, [formData, createUpgradeTargetMutation]);

    const handleEdit = useCallback((target: UpgradeTarget) => {
        setSelectedTarget(target);
        setEditFormData({
            name: target.name,
            description: target.description
        });
        setIsEditDialogOpen(true);
    }, []);

    const handleUpdate = useCallback(() => {
        if (!selectedTarget) return;
        updateUpgradeTargetMutation.mutate({
            id: selectedTarget.id,
            data: editFormData
        });
    }, [selectedTarget, editFormData, updateUpgradeTargetMutation]);

    return (
        <Page isLoading={isLoading}>
            <PageHeader
                title={t('upgrade.title')}
                description={t('upgrade.description')}
                action={{
                    label: t('upgrade.createTarget'),
                    onClick: () => {
                        setIsCreateDialogOpen(true)
                    },
                    icon: Plus
                }}
            />

            <PageContent>
                {/* Filters */}
                <ProjectPackageFilters
                    projectFilter={projectFilter}
                    packageFilter={packageFilter}
                    totalCount={totalTargets}
                    countLabel={t('upgrade.targetsCount')}
                    projects={projects}
                    packages={packages}
                    onProjectFilterChange={setProjectFilter}
                    onPackageFilterChange={setPackageFilter}
                />

                {/* Upgrade Targets Table */}
                <UpgradeTargetsTable
                    upgradeTargets={upgradeTargets}
                    isLoading={isLoading}
                    onEdit={handleEdit}
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
                                        if (pagination.currentPage > 1) {
                                            pagination.setPage(pagination.currentPage - 1);
                                        }
                                    }}
                                    className={pagination.currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>

                            <PaginationItem>
                                <span className="text-sm text-muted-foreground px-4">
                                    第 {pagination.currentPage} 页，共 {totalPages} 页 (总数: {totalTargets})
                                </span>
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (pagination.currentPage < totalPages) {
                                            pagination.setPage(pagination.currentPage + 1);
                                        }
                                    }}
                                    className={pagination.currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}

                {/* Create Upgrade Target Dialog */}
                <CreateUpgradeTargetDialog
                    isOpen={isCreateDialogOpen}
                    onClose={() => {
                        setIsCreateDialogOpen(false);
                        resetForm();
                    }}
                    onSubmit={handleCreate}
                    formData={formData}
                    setFormData={setFormData}
                    projects={projects}
                    packages={packages}
                    isLoading={createUpgradeTargetMutation.isPending}
                />

                {/* Edit Upgrade Target Dialog */}
                <EditUpgradeTargetDialog
                    isOpen={isEditDialogOpen}
                    onClose={() => {
                        setIsEditDialogOpen(false);
                        setSelectedTarget(null);
                        resetEditForm();
                    }}
                    onSubmit={handleUpdate}
                    formData={editFormData}
                    setFormData={setEditFormData}
                    isLoading={updateUpgradeTargetMutation.isPending}
                />
            </PageContent>
        </Page>
    );
}

