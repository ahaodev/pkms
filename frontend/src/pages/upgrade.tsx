import {useCallback, useEffect, useMemo, useState} from 'react';
import {formatFileSize} from '@/lib/utils';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {Card, CardContent} from '@/components/ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {CreateUpgradeTargetDialog, EditUpgradeTargetDialog, UpgradeFilters, UpgradeHeader} from '@/components/upgrade';
import {CheckCircle, Edit, FolderOpen, Package as PackageIcon, Trash2, XCircle} from 'lucide-react';
import {toast} from 'sonner';
import {useProjects} from '@/hooks/use-projects';
import {usePackages} from '@/hooks/use-packages';
import {
    createUpgradeTarget,
    CreateUpgradeTargetRequest,
    deleteUpgradeTarget,
    getUpgradeTargets,
    updateUpgradeTarget,
    UpdateUpgradeTargetRequest,
    UpgradeTarget
} from '@/lib/api/upgrade';

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
    const {data: upgradeTargetsData, isLoading} = useQuery({
        queryKey: ['upgrade-targets'],
        queryFn: async () => {
            const response = await getUpgradeTargets();
            return response.data;
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    });

    const upgradeTargets = upgradeTargetsData || [];

    // Filter upgrade targets based on selected filters
    const filteredUpgradeTargets = useMemo(() => {
        let filtered = upgradeTargets;
        
        if (projectFilter !== 'all') {
            filtered = filtered.filter(target => target.project_id === projectFilter);
        }
        
        if (packageFilter !== 'all') {
            filtered = filtered.filter(target => target.package_id === packageFilter);
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
        onError: (error: any) => {
            toast.error(`创建失败: ${error.response?.data?.message || error.message}`);
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
            toast.error(`更新失败: ${error.response?.data?.message || error.message}`);
        }
    });

    // Delete upgrade target mutation
    const deleteUpgradeTargetMutation = useMutation({
        mutationFn: deleteUpgradeTarget,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['upgrade-targets']});
            toast.success('升级目标删除成功');
        },
        onError: (error: any) => {
            toast.error(`删除失败: ${error.response?.data?.message || error.message}`);
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
            description: target.description,
            is_active: target.is_active
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

    const handleDelete = useCallback((id: string) => {
        if (confirm('确定要删除此升级目标吗？')) {
            deleteUpgradeTargetMutation.mutate(id);
        }
    }, [deleteUpgradeTargetMutation]);

    // formatFileSize 函数已移至 lib/utils.ts 并导入

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('zh-CN');
    };

    // Statistics - use filtered data
    const totalTargets = filteredUpgradeTargets.length;
    return (
        <div className="space-y-6">
            {/* Header */}
            <UpgradeHeader onCreateClick={() => setIsCreateDialogOpen(true)} />

            {/* Filters */}
            <UpgradeFilters
                projectFilter={projectFilter}
                packageFilter={packageFilter}
                totalTargets={totalTargets}
                projects={projects}
                packages={packages}
                onProjectFilterChange={setProjectFilter}
                onPackageFilterChange={setPackageFilter}
            />

            {/* Upgrade Targets Table */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-muted-foreground">加载中...</div>
                        </div>
                    ) : filteredUpgradeTargets.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center space-y-2">
                                <div className="text-muted-foreground">
                                    {upgradeTargets.length === 0 ? '暂无升级目标' : '没有符合筛选条件的升级目标'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {upgradeTargets.length === 0 
                                        ? '点击"创建升级目标"开始配置软件包升级'
                                        : '尝试调整筛选条件或创建新的升级目标'
                                    }
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>项目</TableHead>
                                    <TableHead>软件包</TableHead>
                                    <TableHead>升级目标</TableHead>
                                    <TableHead>目标版本</TableHead>
                                    <TableHead>状态</TableHead>
                                    <TableHead>文件大小</TableHead>
                                    <TableHead>创建时间</TableHead>
                                    <TableHead className="text-right">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUpgradeTargets.map((target) => (
                                    <TableRow key={target.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <FolderOpen className="h-4 w-4 text-muted-foreground"/>
                                                <span className="font-medium">
                                                    {target.project_name || target.project_id}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <PackageIcon className="h-4 w-4 text-muted-foreground"/>
                                                    <span className="font-medium">
                                                        {target.package_name || target.package_id}
                                                    </span>
                                                </div>
                                                {target.package_type && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {target.package_type}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{target.name}</div>
                                                {target.description && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {target.description}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">
                                                    {target.version || 'N/A'
                                                    }
                                                </div>
                                                {target.file_name && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {target.file_name}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={target.is_active ? "default" : "secondary"}
                                                className="flex items-center space-x-1 w-fit"
                                            >
                                                {target.is_active ? (
                                                    <CheckCircle className="h-3 w-3"/>
                                                ) : (
                                                    <XCircle className="h-3 w-3"/>
                                                )}
                                                <span>{target.is_active ? '激活' : '未激活'}</span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {target.file_size ? formatFileSize(target.file_size) : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(target.created_at)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(target)}
                                                >
                                                    <Edit className="h-4 w-4"/>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(target.id)}
                                                >
                                                    <Trash2 className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

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

