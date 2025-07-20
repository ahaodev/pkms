import {useState, useCallback, useEffect} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {
    Plus,
    Edit,
    Trash2,
    Download,
    Smartphone,
    Monitor,
    Globe,
    CheckCircle,
    AlertCircle,
    Clock,
    Package as PackageIcon,
    FolderOpen,
    ChevronRight
} from 'lucide-react';
import {toast} from 'sonner';
import {apiClient} from '@/lib/api/api';
import {useProjects} from '@/hooks/use-projects';
import {usePackages} from '@/hooks/use-packages';
import {ExtendedPackage, Project} from '@/types/simplified';

interface UpgradeVersion {
    id: string;
    packageId: string;
    packageName: string;
    projectName: string;
    packageVersion: string;
    platform: 'android' | 'ios' | 'windows' | 'web';
    status: 'draft' | 'published' | 'deprecated';
    isForced: boolean;
    fileSize: number;
    changelog: string;
    createdAt: string;
    updatedAt: string;
    downloadCount: number;
}

interface CreateUpgradeVersionRequest {
    packageId: string;
    platform: string;
    status: string;
    isForced: boolean;
    changelog: string;
}

const platformIcons = {
    android: <Smartphone className="h-4 w-4" />,
    ios: <Smartphone className="h-4 w-4" />,
    windows: <Monitor className="h-4 w-4" />,
    web: <Globe className="h-4 w-4" />
};

const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    deprecated: 'bg-red-100 text-red-800'
};

const statusIcons = {
    draft: <Clock className="h-3 w-3" />,
    published: <CheckCircle className="h-3 w-3" />,
    deprecated: <AlertCircle className="h-3 w-3" />
};

export default function UpgradePage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState<UpgradeVersion | null>(null);
    const [formData, setFormData] = useState<CreateUpgradeVersionRequest>({
        packageId: '',
        platform: 'android',
        status: 'draft',
        isForced: false,
        changelog: ''
    });

    const queryClient = useQueryClient();

    // Fetch projects and packages
    const {data: projects = []} = useProjects();
    const {data: packagesData} = usePackages();
    const packages = packagesData?.data || [];

    // Fetch upgrade versions
    const {data: upgradeVersions = [], isLoading} = useQuery({
        queryKey: ['upgrade-versions'],
        queryFn: async () => {
            const response = await apiClient.get('/api/v1/upgrade/versions');
            return response.data.data || [];
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    });

    // Create upgrade version mutation
    const createUpgradeVersionMutation = useMutation({
        mutationFn: async (data: CreateUpgradeVersionRequest) => {
            const response = await apiClient.post('/api/v1/upgrade/versions', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['upgrade-versions']});
            setIsCreateDialogOpen(false);
            resetForm();
            toast.success('升级版本创建成功');
        },
        onError: (error: any) => {
            toast.error(`创建失败: ${error.response?.data?.message || error.message}`);
        }
    });

    // Update upgrade version mutation
    const updateUpgradeVersionMutation = useMutation({
        mutationFn: async ({id, data}: {id: string, data: Partial<CreateUpgradeVersionRequest>}) => {
            const response = await apiClient.put(`/api/v1/upgrade/versions/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['upgrade-versions']});
            setIsEditDialogOpen(false);
            setSelectedVersion(null);
            resetForm();
            toast.success('升级版本更新成功');
        },
        onError: (error: any) => {
            toast.error(`更新失败: ${error.response?.data?.message || error.message}`);
        }
    });

    // Delete upgrade version mutation
    const deleteUpgradeVersionMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await apiClient.delete(`/api/v1/upgrade/versions/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['upgrade-versions']});
            toast.success('升级版本删除成功');
        },
        onError: (error: any) => {
            toast.error(`删除失败: ${error.response?.data?.message || error.message}`);
        }
    });

    const resetForm = useCallback(() => {
        setFormData({
            packageId: '',
            platform: 'android',
            status: 'draft',
            isForced: false,
            changelog: ''
        });
    }, []);

    const handleCreate = useCallback(() => {
        createUpgradeVersionMutation.mutate(formData);
    }, [formData, createUpgradeVersionMutation]);

    const handleEdit = useCallback((version: UpgradeVersion) => {
        setSelectedVersion(version);
        setFormData({
            packageId: version.packageId,
            platform: version.platform,
            status: version.status,
            isForced: version.isForced,
            changelog: version.changelog
        });
        setIsEditDialogOpen(true);
    }, []);

    const handleUpdate = useCallback(() => {
        if (!selectedVersion) return;
        updateUpgradeVersionMutation.mutate({
            id: selectedVersion.id,
            data: formData
        });
    }, [selectedVersion, formData, updateUpgradeVersionMutation]);

    const handleDelete = useCallback((id: string) => {
        if (confirm('确定要删除此升级版本吗？')) {
            deleteUpgradeVersionMutation.mutate(id);
        }
    }, [deleteUpgradeVersionMutation]);

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

    // Filter versions by platform
    const androidVersions = upgradeVersions.filter((v: UpgradeVersion) => v.platform === 'android');
    const iosVersions = upgradeVersions.filter((v: UpgradeVersion) => v.platform === 'ios');
    const otherVersions = upgradeVersions.filter((v: UpgradeVersion) => !['android', 'ios'].includes(v.platform));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">升级管理</h1>
                    <p className="text-muted-foreground">
                        从现有项目包中选择版本，为Android、iOS等客户端配置升级策略
                    </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    添加升级版本
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">总升级版本</CardTitle>
                        <PackageIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upgradeVersions.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Android版本</CardTitle>
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{androidVersions.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">iOS版本</CardTitle>
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{iosVersions.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">总下载量</CardTitle>
                        <Download className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {upgradeVersions.reduce((sum: number, v: UpgradeVersion) => sum + v.downloadCount, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Versions Table */}
            <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">全部版本</TabsTrigger>
                    <TabsTrigger value="android">Android</TabsTrigger>
                    <TabsTrigger value="ios">iOS</TabsTrigger>
                    <TabsTrigger value="other">其他平台</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    <UpgradeVersionTable 
                        versions={upgradeVersions}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        formatFileSize={formatFileSize}
                        formatDate={formatDate}
                        platformIcons={platformIcons}
                        statusColors={statusColors}
                        statusIcons={statusIcons}
                        isLoading={isLoading}
                    />
                </TabsContent>

                <TabsContent value="android" className="space-y-4">
                    <UpgradeVersionTable 
                        versions={androidVersions}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        formatFileSize={formatFileSize}
                        formatDate={formatDate}
                        platformIcons={platformIcons}
                        statusColors={statusColors}
                        statusIcons={statusIcons}
                        isLoading={isLoading}
                    />
                </TabsContent>

                <TabsContent value="ios" className="space-y-4">
                    <UpgradeVersionTable 
                        versions={iosVersions}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        formatFileSize={formatFileSize}
                        formatDate={formatDate}
                        platformIcons={platformIcons}
                        statusColors={statusColors}
                        statusIcons={statusIcons}
                        isLoading={isLoading}
                    />
                </TabsContent>

                <TabsContent value="other" className="space-y-4">
                    <UpgradeVersionTable 
                        versions={otherVersions}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        formatFileSize={formatFileSize}
                        formatDate={formatDate}
                        platformIcons={platformIcons}
                        statusColors={statusColors}
                        statusIcons={statusIcons}
                        isLoading={isLoading}
                    />
                </TabsContent>
            </Tabs>

            {/* Create Upgrade Version Dialog */}
            <PackageSelectionDialog
                isOpen={isCreateDialogOpen}
                onClose={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                }}
                onSubmit={handleCreate}
                formData={formData}
                setFormData={setFormData}
                title="添加升级版本"
                projects={projects}
                packages={packages}
                isLoading={createUpgradeVersionMutation.isPending}
            />

            {/* Edit Upgrade Version Dialog */}
            <PackageSelectionDialog
                isOpen={isEditDialogOpen}
                onClose={() => {
                    setIsEditDialogOpen(false);
                    setSelectedVersion(null);
                    resetForm();
                }}
                onSubmit={handleUpdate}
                formData={formData}
                setFormData={setFormData}
                title="编辑升级版本"
                projects={projects}
                packages={packages}
                isLoading={updateUpgradeVersionMutation.isPending}
            />
        </div>
    );
}

// Upgrade Version Table Component
interface UpgradeVersionTableProps {
    versions: UpgradeVersion[];
    onEdit: (version: UpgradeVersion) => void;
    onDelete: (id: string) => void;
    formatFileSize: (bytes: number) => string;
    formatDate: (dateString: string) => string;
    platformIcons: Record<string, JSX.Element>;
    statusColors: Record<string, string>;
    statusIcons: Record<string, JSX.Element>;
    isLoading: boolean;
}

function UpgradeVersionTable({
    versions,
    onEdit,
    onDelete,
    formatFileSize,
    formatDate,
    platformIcons,
    statusColors,
    statusIcons,
    isLoading
}: UpgradeVersionTableProps) {
    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground">加载中...</div>
                </CardContent>
            </Card>
        );
    }

    if (versions.length === 0) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center space-y-2">
                        <div className="text-muted-foreground">暂无升级版本</div>
                        <div className="text-sm text-muted-foreground">
                            点击"添加升级版本"从现有项目包中选择版本
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>包信息</TableHead>
                            <TableHead>版本号</TableHead>
                            <TableHead>平台</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>文件大小</TableHead>
                            <TableHead>下载量</TableHead>
                            <TableHead>创建时间</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {versions.map((version) => (
                            <TableRow key={version.id}>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">{version.projectName}</span>
                                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                            <PackageIcon className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{version.packageName}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium">{version.packageVersion}</div>
                                        {version.isForced && (
                                            <Badge variant="destructive" className="text-xs">
                                                强制更新
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        {platformIcons[version.platform]}
                                        <span className="capitalize">{version.platform}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge 
                                        variant="secondary" 
                                        className={`${statusColors[version.status]} flex items-center space-x-1`}
                                    >
                                        {statusIcons[version.status]}
                                        <span className="capitalize">{version.status}</span>
                                    </Badge>
                                </TableCell>
                                <TableCell>{formatFileSize(version.fileSize)}</TableCell>
                                <TableCell>{version.downloadCount.toLocaleString()}</TableCell>
                                <TableCell>{formatDate(version.createdAt)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(version)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(version.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// Package Selection Dialog Component
interface PackageSelectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    formData: CreateUpgradeVersionRequest;
    setFormData: React.Dispatch<React.SetStateAction<CreateUpgradeVersionRequest>>;
    title: string;
    projects: Project[];
    packages: ExtendedPackage[];
    isLoading: boolean;
}

function PackageSelectionDialog({
    isOpen,
    onClose,
    onSubmit,
    formData,
    setFormData,
    title,
    projects,
    packages,
    isLoading
}: PackageSelectionDialogProps) {
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedPackageId, setSelectedPackageId] = useState('');

    // Filter packages by selected project
    const filteredPackages = selectedProjectId 
        ? packages.filter(pkg => pkg.projectId === selectedProjectId)
        : [];

    const selectedPackage = packages.find(pkg => pkg.id === selectedPackageId);

    useEffect(() => {
        if (selectedPackageId) {
            setFormData(prev => ({...prev, packageId: selectedPackageId}));
        }
    }, [selectedPackageId, setFormData]);

    const handleProjectChange = (projectId: string) => {
        setSelectedProjectId(projectId);
        setSelectedPackageId(''); // Reset package selection
        setFormData(prev => ({...prev, packageId: ''}));
    };

    const isFormValid = formData.packageId && formData.platform && formData.status;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        从现有项目中选择包版本，配置升级策略
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Project Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="project">选择项目</Label>
                        <Select value={selectedProjectId} onValueChange={handleProjectChange}>
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
                        <Label htmlFor="package">选择包</Label>
                        <Select 
                            value={selectedPackageId} 
                            onValueChange={setSelectedPackageId}
                            disabled={!selectedProjectId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={selectedProjectId ? "请选择包" : "请先选择项目"} />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredPackages.map(pkg => (
                                    <SelectItem key={pkg.id} value={pkg.id}>
                                        <div className="flex items-center space-x-2">
                                            <PackageIcon className="h-4 w-4" />
                                            <span>{pkg.name}</span>
                                            <span className="text-sm text-muted-foreground">({pkg.type})</span>
                                            {pkg.version && (
                                                <Badge variant="outline" className="text-xs">
                                                    v{pkg.version}
                                                </Badge>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Selected Package Info */}
                    {selectedPackage && (
                        <Card>
                            <CardContent className="pt-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">包名:</span>
                                        <span>{selectedPackage.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">类型:</span>
                                        <span>{selectedPackage.type}</span>
                                    </div>
                                    {selectedPackage.version && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">版本:</span>
                                            <span>{selectedPackage.version}</span>
                                        </div>
                                    )}
                                    {selectedPackage.fileSize && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">文件大小:</span>
                                            <span>{(selectedPackage.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Platform Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="platform">目标平台</Label>
                        <Select
                            value={formData.platform}
                            onValueChange={(value) => setFormData(prev => ({...prev, platform: value}))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="android">
                                    <div className="flex items-center space-x-2">
                                        <Smartphone className="h-4 w-4" />
                                        <span>Android</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="ios">
                                    <div className="flex items-center space-x-2">
                                        <Smartphone className="h-4 w-4" />
                                        <span>iOS</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="windows">
                                    <div className="flex items-center space-x-2">
                                        <Monitor className="h-4 w-4" />
                                        <span>Windows</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="web">
                                    <div className="flex items-center space-x-2">
                                        <Globe className="h-4 w-4" />
                                        <span>Web</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="status">发布状态</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData(prev => ({...prev, status: value}))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4" />
                                        <span>草稿</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="published">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>已发布</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="deprecated">
                                    <div className="flex items-center space-x-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>已废弃</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Force Update Checkbox */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isForced"
                            checked={formData.isForced}
                            onChange={(e) => setFormData(prev => ({...prev, isForced: e.target.checked}))}
                            className="h-4 w-4"
                        />
                        <Label htmlFor="isForced">强制更新</Label>
                    </div>

                    {/* Changelog */}
                    <div className="space-y-2">
                        <Label htmlFor="changelog">更新说明</Label>
                        <Textarea
                            id="changelog"
                            placeholder="描述此版本的更新内容..."
                            value={formData.changelog}
                            onChange={(e) => setFormData(prev => ({...prev, changelog: e.target.value}))}
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        取消
                    </Button>
                    <Button onClick={onSubmit} disabled={isLoading || !isFormValid}>
                        {isLoading ? '保存中...' : '保存'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}