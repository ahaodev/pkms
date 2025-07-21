import {useEffect, useMemo, useState} from 'react';
import {useCreateProject, useProjects, useUpdateProject} from '@/hooks/use-projects';
import {usePackages} from '@/hooks/use-packages';
import {ExtendedPackage} from '@/types/package';
import {Release} from '@/types/release';
import {useToast} from '@/hooks/use-toast';
import {Input} from '@/components/ui/input';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import {Search} from 'lucide-react';
import {getProjectIcon, iconOptions, ProjectDialog} from '@/components/project';
import {Projects} from '@/components/projects.tsx';
import {Packages} from '@/components/packages.tsx';
import {Releases} from '@/components/releases.tsx';
import {useLocation} from 'react-router-dom';
import {PackageReleaseDialog} from "@/components/package-release-dialog.tsx";
import {PackageCreateDialog} from "@/components/package-create-dialog.tsx";

// Hierarchy Page Component
export default function HierarchyPage() {
    const {toast} = useToast();
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Project creation and editing state
    const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false);
    const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<any>(null);
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
    const updateProject = useUpdateProject();
    const {data: packagesData} = usePackages({
        projectId: selectedProjectId || undefined
    });
    const packages: ExtendedPackage[] = packagesData?.data || [];

    const selectedProject = projects?.find(p => p.id === selectedProjectId);
    const selectedPackage = packages.find(p => p.id === selectedPackageId);


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

    const handleEditProject = (project: any) => {
        setEditingProject(project);
        setProjectFormData({
            name: project.name,
            description: project.description,
            icon: project.icon
        });
        setIsEditProjectDialogOpen(true);
    };

    const handleUpdateProject = async () => {
        if (!editingProject) return;

        try {
            await updateProject.mutateAsync({
                id: editingProject.id,
                update: projectFormData
            });
            toast({
                title: '项目更新成功',
                description: `项目 "${projectFormData.name}" 已成功更新。`,
            });
            setIsEditProjectDialogOpen(false);
            setEditingProject(null);
            setProjectFormData({name: '', description: '', icon: 'package2'});
        } catch {
            toast({
                variant: 'destructive',
                title: '更新失败',
                description: '项目更新失败，请重试。',
            });
        }
    };

    const handleCreateProjectDialogClose = () => {
        setIsCreateProjectDialogOpen(false);
        setProjectFormData({name: '', description: '', icon: 'package2'});
    };

    const handleEditProjectDialogClose = () => {
        setIsEditProjectDialogOpen(false);
        setEditingProject(null);
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
        setUploadProgress({percentage: 0, loaded: 0, total: releaseData.file.size});

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
            console.error(error);
            toast({
                variant: 'destructive',
                title: '发布失败',
                description: '发布失败，请重试。',
            });
        } finally {
            setIsUploading(false);
        }
    };

    // Handle mouse back button for hierarchy navigation
    useEffect(() => {
        const handleMouseBack = (event: MouseEvent) => {
            // Check if the back button (button 3) was clicked
            if (event.button === 3) {
                event.preventDefault();
                handleGoBack();
            }
        };

        // Add event listener for mouse button down
        document.addEventListener('mousedown', handleMouseBack);

        // Cleanup event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleMouseBack);
        };
    }, [selectedProjectId, selectedPackageId]); // Dependencies to ensure current state is captured

    // 路由变化时重置搜索框
    const location = useLocation();
    useEffect(() => {
        setSearchTerm('');
    }, [location.pathname]);

    // 搜索提示文案根据层级变化
    let searchPlaceholder = '搜索项目或包...';
    if (!selectedProjectId) {
        searchPlaceholder = '搜索项目...';
    } else if (selectedProjectId && !selectedPackageId) {
        searchPlaceholder = '搜索包...';
    } else if (selectedProjectId && selectedPackageId) {
        searchPlaceholder = '搜索历史发布版本...';
    }

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
                    placeholder={searchPlaceholder}
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
                    <Projects
                        projects={projects || []}
                        searchTerm={searchTerm}
                        handleProjectSelect={handleProjectSelect}
                        onCreateProject={() => setIsCreateProjectDialogOpen(true)}
                        onEditProject={handleEditProject}
                    />
                ) : selectedProjectId && !selectedPackageId ? (
                    <Packages
                        selectedProject={selectedProject}
                        packages={packages}
                        searchTerm={searchTerm}
                        handlePackageSelect={handlePackageSelect}
                        onCreatePackage={() => setIsCreatePackageDialogOpen(true)}
                    />
                ) : (
                    <Releases
                        selectedPackage={selectedPackage}
                        releases={releases}
                        searchTerm={searchTerm}
                        handleCreateRelease={handleCreateRelease}
                        handleDownload={handleDownload}
                    />
                )}
            </div>

            {/* Create Project Dialog */}
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

            {/* Edit Project Dialog */}
            <ProjectDialog
                open={isEditProjectDialogOpen}
                onClose={handleEditProjectDialogClose}
                onSubmit={handleUpdateProject}
                title="编辑项目"
                isEdit={true}
                formData={projectFormData}
                setFormData={setProjectFormData}
                iconOptions={iconOptions}
                getProjectIcon={getProjectIcon}
                isLoading={updateProject.isPending}
            />

            {/* Package Dialog */}
            <PackageCreateDialog
                open={isCreatePackageDialogOpen}
                onClose={handleCreatePackageDialogClose}
                projectID={selectedProjectId || ''}
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