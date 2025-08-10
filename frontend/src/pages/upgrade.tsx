import {useCallback, useEffect, useMemo, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {CreateUpgradeTargetDialog, EditUpgradeTargetDialog, UpgradeTargetsTable} from '@/components/upgrade';
import {ProjectPackageFilters} from '@/components/shared';
import {toast} from 'sonner';
import {useProjects} from '@/hooks/use-projects';
import {usePackages} from '@/hooks/use-packages';
import {
    createUpgradeTarget,
    CreateUpgradeTargetRequest,
    getUpgradeTargets,
    updateUpgradeTarget,
    UpdateUpgradeTargetRequest,
    UpgradeTarget
} from '@/lib/api/upgrade';
import {PageHeader} from "@/components/ui";
import {Plus} from "lucide-react";

export default function UpgradePage() {
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

    // Fetch data
    const {data: projects = []} = useProjects();
    const {data: packagesData} = usePackages();
    const packages = packagesData?.data || [];

    console.log('All packages:', packages);
    console.log('Projects:', projects);

    // Fetch upgrade targets
    const {data: upgradeTargetsData, isLoading, error} = useQuery({
        queryKey: ['upgrade-targets'],
        queryFn: async () => {
            const response = await getUpgradeTargets();
            return response.data;
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: false
    });

    // Handle query error
    useEffect(() => {
        if (error) {
            console.error('获取升级目标失败:', error);
            const errorMessage = (error as any)?.response?.data?.msg || (error as any)?.message || '获取升级目标失败';
            toast.error(errorMessage);
        }
    }, [error]);

    const upgradeTargets: UpgradeTarget[] = upgradeTargetsData || [];

    // Filter upgrade targets based on selected filters
    const filteredUpgradeTargets = useMemo(() => {
        let filtered: UpgradeTarget[] = upgradeTargets;

        if (projectFilter !== 'all') {
            filtered = filtered.filter((target: UpgradeTarget) => target.project_id === projectFilter);
        }

        if (packageFilter !== 'all') {
            filtered = filtered.filter((target: UpgradeTarget) => target.package_id === packageFilter);
        }

        return filtered;
    }, [upgradeTargets, projectFilter, packageFilter]);

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
            toast.success('升级目标创建成功');
        },
        onError: (err: any) => {
            console.error(err);
            const errorMessage = err?.response?.data?.msg || err?.message || '创建失败';
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
            toast.success('升级目标更新成功');
        },
        onError: (error: any) => {
            console.error(error);
            const errorMessage = error?.response?.data?.msg || error?.message || '更新失败';
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

    // Statistics - use filtered data
    const totalTargets = filteredUpgradeTargets.length;
    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                title="升级管理"
                description="管理软件包的升级目标，为客户端提供版本检查和下载服务"
                action={{
                    label: "创建升级目标",
                    onClick: () => {
                        setIsCreateDialogOpen(false)
                    },
                    icon: Plus
                }}
            />

            {/* Filters */}
            <ProjectPackageFilters
                projectFilter={projectFilter}
                packageFilter={packageFilter}
                totalCount={totalTargets}
                countLabel="个升级目标"
                projects={projects}
                packages={packages}
                onProjectFilterChange={setProjectFilter}
                onPackageFilterChange={setPackageFilter}
            />

            {/* Upgrade Targets Table */}
            <UpgradeTargetsTable
                upgradeTargets={filteredUpgradeTargets}
                isLoading={isLoading}
                onEdit={handleEdit}
            />

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
        </div>
    );
}

