import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useCreateProject, useProjects} from '@/hooks/use-projects';
import {usePackages} from '@/hooks/use-packages';
import {ExtendedPackage, Release} from '@/types/simplified';
import {useToast} from '@/hooks/use-toast';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import {ChevronRight, Download, FolderOpen, Package as PackageIcon, Plus, Search} from 'lucide-react';
import {formatDate, formatFileSize} from '@/lib/utils';
import {getProjectIcon, iconOptions, ProjectDialog} from '@/components/project';
import {PackageCreateDialog, PackageReleaseDialog} from '@/components/package';

export default function HierarchyPage() {
    const navigate = useNavigate();
    const {toast} = useToast();
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Project creation state
    const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false);
    const [projectFormData, setProjectFormData] = useState({
        name: '',
        description: '',
        icon: 'package2'
    });

    // Package creation state
    const [isCreatePackageDialogOpen, setIsCreatePackageDialogOpen] = useState(false);

    // Release creation state
    const [isCreateReleaseDialogOpen, setIsCreateReleaseDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<any>(null);

    const {data: projects} = useProjects();
    const createProject = useCreateProject();
    const {data: packagesData} = usePackages({
        projectId: selectedProjectId || undefined
    });
    const packages: ExtendedPackage[] = packagesData?.data || [];

    const selectedProject = projects?.find(p => p.id === selectedProjectId);
    const selectedPackage = packages.find(p => p.id === selectedPackageId);

    const filteredProjects = projects?.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const filteredPackages = packages.filter(pkg =>
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Mock releases data - in real app this would come from an API
    const releases: Release[] = useMemo(() => {
        if (!selectedPackage) return [];

        return [
            {
                id: '1',
                packageId: selectedPackage.id,
                version: '2.1.0',
                title: '新功能发布',
                description: '添加了新的用户界面和性能优化',
                filePath: '/releases/app-v2.1.0.apk',
                fileName: 'app-v2.1.0.apk',
                fileSize: 25600000,
                isPrerelease: false,
                isLatest: true,
                isDraft: false,
                downloadCount: 156,
                createdBy: 'admin',
                createdAt: new Date('2024-01-15'),
                publishedAt: new Date('2024-01-15')
            },
            {
                id: '2',
                packageId: selectedPackage.id,
                version: '2.0.1',
                title: '修复版本',
                description: '修复了关键性错误和安全漏洞',
                filePath: '/releases/app-v2.0.1.apk',
                fileName: 'app-v2.0.1.apk',
                fileSize: 24800000,
                isPrerelease: false,
                isLatest: false,
                isDraft: false,
                downloadCount: 89,
                createdBy: 'admin',
                createdAt: new Date('2024-01-10'),
                publishedAt: new Date('2024-01-10')
            },
            {
                id: '3',
                packageId: selectedPackage.id,
                version: '2.0.0',
                title: '重大版本更新',
                description: '全新的架构和用户体验',
                filePath: '/releases/app-v2.0.0.apk',
                fileName: 'app-v2.0.0.apk',
                fileSize: 23400000,
                isPrerelease: false,
                isLatest: false,
                isDraft: false,
                downloadCount: 234,
                createdBy: 'admin',
                createdAt: new Date('2024-01-01'),
                publishedAt: new Date('2024-01-01')
            }
        ];
    }, [selectedPackage]);

    const handleProjectSelect = (projectId: string) => {
        if (selectedProjectId === projectId) {
            setSelectedProjectId(null);
            setSelectedPackageId(null);
        } else {
            setSelectedProjectId(projectId);
            setSelectedPackageId(null);
        }
    };

    const handlePackageSelect = (packageId: string) => {
        setSelectedPackageId(packageId);
    };

    const handleGoBack = () => {
        if (selectedPackageId) {
            setSelectedPackageId(null);
        } else if (selectedProjectId) {
            setSelectedProjectId(null);
        }
    };

    const handleCreateRelease = () => {
        setIsCreateReleaseDialogOpen(true);
    };

    const handleDownload = (release: Release) => {
        window.open(`/api/packages/${release.id}/download`, '_blank');
        toast({
            title: '下载开始',
            description: `开始下载 ${release.fileName}`,
        });
    };

    const handleCreateProject = async () => {
        try {
            await createProject.mutateAsync(projectFormData);
            toast({
                title: '项目创建成功',
                description: `项目 "${projectFormData.name}" 已成功创建。`,
            });
            setIsCreateProjectDialogOpen(false);
            setProjectFormData({name: '', description: '', icon: 'package2'});
        } catch {
            toast({
                variant: 'destructive',
                title: '创建失败',
                description: '项目创建失败，请重试。',
            });
        }
    };

    const handleCreateProjectDialogClose = () => {
        setIsCreateProjectDialogOpen(false);
        setProjectFormData({name: '', description: '', icon: 'package2'});
    };

    const handleCreatePackageDialogClose = () => {
        setIsCreatePackageDialogOpen(false);
    };

    const handleCreateReleaseDialogClose = () => {
        setIsCreateReleaseDialogOpen(false);
        setUploadProgress(null);
    };

    const handleReleaseUpload = async (releaseData: any) => {
        setIsUploading(true);
        setUploadProgress({ percentage: 0, loaded: 0, total: releaseData.file.size });

        try {
            // Simulate upload progress
            for (let i = 0; i <= 100; i += 10) {
                setUploadProgress({ 
                    percentage: i, 
                    loaded: (releaseData.file.size * i) / 100, 
                    total: releaseData.file.size 
                });
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            toast({
                title: '发布成功',
                description: `版本 "${releaseData.version}" 已成功发布。`,
            });

            setIsCreateReleaseDialogOpen(false);
            setUploadProgress(null);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: '发布失败',
                description: '发布失败，请重试。',
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">项目包管理</h1>
                </div>

            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <Input
                    placeholder="搜索项目或包..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Breadcrumb Navigation */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="#" onClick={() => {
                            setSelectedProjectId(null);
                            setSelectedPackageId(null);
                        }}>
                            项目
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {selectedProject && (
                        <>
                            <BreadcrumbSeparator/>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="#" onClick={() => setSelectedPackageId(null)}>
                                    {selectedProject.name}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            {selectedPackage && (
                                <>
                                    <BreadcrumbSeparator/>
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>{selectedPackage.name}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </>
                            )}
                        </>
                    )}
                </BreadcrumbList>
            </Breadcrumb>

            {/* Content */}
            <div className="grid gap-6">
                {!selectedProjectId ? (
                    // Projects View
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <h2 className="text-lg font-semibold">选择项目</h2>
                            <Badge variant="secondary">{filteredProjects.length} 个项目</Badge>
                            <Button variant="outline" onClick={() => setIsCreateProjectDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4"/>
                                新建项目
                            </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredProjects.map((project) => (
                                <Card
                                    key={project.id}
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => handleProjectSelect(project.id)}
                                >
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-3">
                                            <FolderOpen className="h-5 w-5 text-blue-600"/>
                                            <span>{project.name}</span>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto"/>
                                        </CardTitle>
                                        <CardDescription>{project.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">包数量</span>
                                            <Badge variant="outline">{project.packageCount || 0}</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {filteredProjects.length === 0 && (
                            <Card>
                                <CardContent className="flex items-center justify-center py-8">
                                    <div className="text-center space-y-2">
                                        <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto"/>
                                        <div className="text-muted-foreground">
                                            {searchTerm ? '未找到匹配的项目' : '暂无项目'}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                ) : selectedProjectId && !selectedPackageId ? (
                    // Packages View
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                {selectedProject?.name} - 选择包
                            </h2>
                            <div className="flex items-center space-x-2">
                                <Badge variant="secondary">{filteredPackages.length} 个包</Badge>
                                <Button size="sm" onClick={() => setIsCreatePackageDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4"/>
                                    新建包
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredPackages.map((pkg) => (
                                <Card
                                    key={pkg.id}
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => handlePackageSelect(pkg.id)}
                                >
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-3">
                                            <PackageIcon className="h-5 w-5 text-green-600"/>
                                            <span>{pkg.name}</span>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto"/>
                                        </CardTitle>
                                        <CardDescription>{pkg.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">类型</span>
                                                <Badge variant="outline" className="capitalize">{pkg.type}</Badge>
                                            </div>
                                            {pkg.version && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">最新版本</span>
                                                    <Badge variant="default">v{pkg.version}</Badge>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {filteredPackages.length === 0 && (
                            <Card>
                                <CardContent className="flex items-center justify-center py-8">
                                    <div className="text-center space-y-2">
                                        <PackageIcon className="h-12 w-12 text-muted-foreground mx-auto"/>
                                        <div className="text-muted-foreground">
                                            {searchTerm ? '未找到匹配的包' : '该项目暂无包'}
                                        </div>
                                        <Button onClick={() => setIsCreatePackageDialogOpen(true)}>
                                            <Plus className="mr-2 h-4 w-4"/>
                                            创建首个包
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                ) : (
                    // Releases View
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                {selectedPackage?.name}
                            </h2>
                            <Button onClick={handleCreateRelease}>
                                <Plus className="mr-2 h-4 w-4"/>
                                新建发布
                            </Button>
                        </div>

                        {/* Releases List */}
                        <div className="space-y-4">
                            {releases.map((release) => (
                                <Card key={release.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div>
                                                    <CardTitle className="flex items-center space-x-2">
                                                        <span>v{release.version}</span>
                                                        {release.isLatest && (
                                                            <Badge variant="default">最新</Badge>
                                                        )}
                                                        {release.isPrerelease && (
                                                            <Badge variant="secondary">预发布</Badge>
                                                        )}
                                                        {release.isDraft && (
                                                            <Badge variant="outline">草稿</Badge>
                                                        )}
                                                    </CardTitle>
                                                    <CardDescription>{release.title}</CardDescription>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button variant="outline" size="sm"
                                                        onClick={() => handleDownload(release)}>
                                                    <Download className="h-4 w-4 mr-2"/>
                                                    下载
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <p className="text-sm text-muted-foreground">{release.description}</p>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">文件名:</span>
                                                    <div className="font-medium">{release.fileName}</div>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">文件大小:</span>
                                                    <div
                                                        className="font-medium">{formatFileSize(release.fileSize)}</div>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">下载次数:</span>
                                                    <div
                                                        className="font-medium">{release.downloadCount.toLocaleString()}</div>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">发布时间:</span>
                                                    <div
                                                        className="font-medium">{formatDate(release.createdAt.toISOString())}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {releases.length === 0 && (
                            <Card>
                                <CardContent className="flex items-center justify-center py-8">
                                    <div className="text-center space-y-2">
                                        <PackageIcon className="h-12 w-12 text-muted-foreground mx-auto"/>
                                        <div className="text-muted-foreground">该包暂无版本发布</div>
                                        <Button onClick={handleCreateRelease}>
                                            <Plus className="mr-2 h-4 w-4"/>
                                            创建首个发布
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>

            {/* Project Dialog */}
            <ProjectDialog
                open={isCreateProjectDialogOpen}
                onClose={handleCreateProjectDialogClose}
                onSubmit={handleCreateProject}
                title="创建新项目"
                formData={projectFormData}
                setFormData={setProjectFormData}
                iconOptions={iconOptions}
                getProjectIcon={getProjectIcon}
                isLoading={createProject.isPending}
            />

            {/* Package Dialog */}
            <PackageCreateDialog
                open={isCreatePackageDialogOpen}
                onClose={handleCreatePackageDialogClose}
                projects={projects}
                initialProjectId={selectedProjectId || ''}
            />

            {/* Release Dialog */}
            {selectedPackage && (
                <PackageReleaseDialog
                    open={isCreateReleaseDialogOpen}
                    onClose={handleCreateReleaseDialogClose}
                    onUpload={handleReleaseUpload}
                    packageId={selectedPackage.id}
                    packageName={selectedPackage.name}
                    uploadProgress={uploadProgress}
                    isUploading={isUploading}
                />
            )}
        </div>
    );
}