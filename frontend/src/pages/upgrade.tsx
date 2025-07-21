import {useCallback, useEffect, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {Card, CardContent, CardHeader, CardTitle,} from '@/components/ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Switch} from '@/components/ui/switch';
import {
    Activity,
    CheckCircle,
    ChevronRight,
    Edit,
    FolderOpen,
    Package as PackageIcon,
    Plus,
    Target,
    Trash2,
    XCircle
} from 'lucide-react';
import {toast} from 'sonner';
import {useProjects} from '@/hooks/use-projects';
import {usePackages} from '@/hooks/use-packages';
import {getReleases} from '@/lib/api/releases';
import {
    createUpgradeTarget,
    CreateUpgradeTargetRequest,
    deleteUpgradeTarget,
    getUpgradeTargets,
    updateUpgradeTarget,
    UpdateUpgradeTargetRequest,
    UpgradeTarget
} from '@/lib/api/upgrade';
import {ExtendedPackage} from '@/types/package';
import {Project} from '@/types/project';

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

    const queryClient = useQueryClient();

    // Fetch data
    const { data: projects = [] } = useProjects();
    const { data: packagesData } = usePackages();
    const packages = packagesData?.data || [];

    // Fetch upgrade targets
    const { data: upgradeTargetsData, isLoading } = useQuery({
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

    // Create upgrade target mutation
    const createUpgradeTargetMutation = useMutation({
        mutationFn: createUpgradeTarget,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['upgrade-targets'] });
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
        mutationFn: ({ id, data }: { id: string, data: UpdateUpgradeTargetRequest }) => 
            updateUpgradeTarget(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['upgrade-targets'] });
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
            queryClient.invalidateQueries({ queryKey: ['upgrade-targets'] });
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

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('zh-CN');
    };

    // Statistics
    const totalTargets = upgradeTargets.length;
    const activeTargets = upgradeTargets.filter(t => t.is_active).length;
    const inactiveTargets = totalTargets - activeTargets;
    const projectsWithTargets = new Set(upgradeTargets.map(t => t.project_id)).size;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">升级目标管理</h1>
                    <p className="text-muted-foreground">
                        管理软件包的升级目标，为客户端提供版本检查和下载服务
                    </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    创建升级目标
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">总升级目标</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTargets}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">激活状态</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeTargets}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">非激活状态</CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inactiveTargets}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">涉及项目</CardTitle>
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{projectsWithTargets}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Upgrade Targets Table */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-muted-foreground">加载中...</div>
                        </div>
                    ) : upgradeTargets.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center space-y-2">
                                <div className="text-muted-foreground">暂无升级目标</div>
                                <div className="text-sm text-muted-foreground">
                                    点击"创建升级目标"开始配置软件包升级
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>升级目标</TableHead>
                                    <TableHead>项目/包信息</TableHead>
                                    <TableHead>目标版本</TableHead>
                                    <TableHead>状态</TableHead>
                                    <TableHead>文件大小</TableHead>
                                    <TableHead>创建时间</TableHead>
                                    <TableHead className="text-right">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {upgradeTargets.map((target) => (
                                    <TableRow key={target.id}>
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
                                                <div className="flex items-center space-x-2">
                                                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">
                                                        {target.project_name || target.project_id}
                                                    </span>
                                                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                                    <PackageIcon className="h-4 w-4 text-muted-foreground" />
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
                                                <div className="font-medium">
                                                    {target.version || 'N/A'}
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
                                                    <CheckCircle className="h-3 w-3" />
                                                ) : (
                                                    <XCircle className="h-3 w-3" />
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
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(target.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
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

// Create Upgrade Target Dialog Component
interface CreateUpgradeTargetDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    formData: CreateUpgradeTargetRequest;
    setFormData: React.Dispatch<React.SetStateAction<CreateUpgradeTargetRequest>>;
    projects: Project[];
    packages: ExtendedPackage[];
    isLoading: boolean;
}

function CreateUpgradeTargetDialog({
    isOpen,
    onClose,
    onSubmit,
    formData,
    setFormData,
    projects,
    packages,
    isLoading
}: CreateUpgradeTargetDialogProps) {
    const [releases, setReleases] = useState<any[]>([]);
    const [loadingReleases, setLoadingReleases] = useState(false);

    // Filter packages by selected project
    const filteredPackages = formData.project_id
        ? packages.filter(pkg => pkg.projectId === formData.project_id)
        : [];

    // Load releases when package is selected
    useEffect(() => {
        if (formData.package_id) {
            setLoadingReleases(true);
            getReleases({ packageId: formData.package_id })
                .then((response: { data: any[] }) => {
                    setReleases(response.data || []);
                })
                .catch((error: any) => {
                    console.error('Failed to load releases:', error);
                    setReleases([]);
                })
                .finally(() => {
                    setLoadingReleases(false);
                });
        } else {
            setReleases([]);
        }
    }, [formData.package_id]);

    const handleProjectChange = (projectId: string) => {
        setFormData(prev => ({
            ...prev,
            project_id: projectId,
            package_id: '',
            release_id: ''
        }));
    };

    const handlePackageChange = (packageId: string) => {
        setFormData(prev => ({
            ...prev,
            package_id: packageId,
            release_id: ''
        }));
    };

    const isFormValid = formData.project_id && formData.package_id && formData.release_id && formData.name.trim();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>创建升级目标</DialogTitle>
                    <DialogDescription>
                        选择项目、软件包和版本，创建升级目标供客户端检查更新
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Project Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="project">选择项目</Label>
                        <Select value={formData.project_id} onValueChange={handleProjectChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="请选择项目" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map(project => (
                                    <SelectItem key={project.id} value={project.id}>
                                        <div className="flex items-center space-x-2">
                                            <FolderOpen className="h-4 w-4" />
                                            <span>{project.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Package Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="package">选择软件包</Label>
                        <Select
                            value={formData.package_id}
                            onValueChange={handlePackageChange}
                            disabled={!formData.project_id}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={formData.project_id ? "请选择软件包" : "请先选择项目"} />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredPackages.map(pkg => (
                                    <SelectItem key={pkg.id} value={pkg.id}>
                                        <div className="flex items-center space-x-2">
                                            <PackageIcon className="h-4 w-4" />
                                            <span>{pkg.name}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {pkg.type}
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Release Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="release">选择版本</Label>
                        <Select
                            value={formData.release_id}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, release_id: value }))}
                            disabled={!formData.package_id || loadingReleases}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={
                                    loadingReleases ? "加载版本中..." :
                                    formData.package_id ? "请选择版本" : "请先选择软件包"
                                } />
                            </SelectTrigger>
                            <SelectContent>
                                {releases.map(release => (
                                    <SelectItem key={release.id} value={release.id}>
                                        <div className="flex items-center space-x-2">
                                            <Activity className="h-4 w-4" />
                                            <span>{release.version}</span>
                                            {release.title && (
                                                <span className="text-sm text-muted-foreground">
                                                    - {release.title}
                                                </span>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">升级目标名称</Label>
                        <Input
                            id="name"
                            placeholder="输入升级目标名称"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">描述（可选）</Label>
                        <Textarea
                            id="description"
                            placeholder="描述此升级目标的用途..."
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        取消
                    </Button>
                    <Button onClick={onSubmit} disabled={isLoading || !isFormValid}>
                        {isLoading ? '创建中...' : '创建'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Edit Upgrade Target Dialog Component
interface EditUpgradeTargetDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    formData: UpdateUpgradeTargetRequest;
    setFormData: React.Dispatch<React.SetStateAction<UpdateUpgradeTargetRequest>>;
    isLoading: boolean;
}

function EditUpgradeTargetDialog({
    isOpen,
    onClose,
    onSubmit,
    formData,
    setFormData,
    isLoading
}: EditUpgradeTargetDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>编辑升级目标</DialogTitle>
                    <DialogDescription>
                        修改升级目标的名称、描述和状态
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">升级目标名称</Label>
                        <Input
                            id="name"
                            placeholder="输入升级目标名称"
                            value={formData.name || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">描述</Label>
                        <Textarea
                            id="description"
                            placeholder="描述此升级目标的用途..."
                            value={formData.description || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                        />
                    </div>

                    {/* Is Active */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_active"
                            checked={formData.is_active ?? true}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                        />
                        <Label htmlFor="is_active">激活状态</Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        取消
                    </Button>
                    <Button onClick={onSubmit} disabled={isLoading}>
                        {isLoading ? '保存中...' : '保存'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}