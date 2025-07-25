import {useEffect, useState} from 'react';
import {useCreateProject, useProjects, useUpdateProject} from '@/hooks/use-projects';
import {useQueryClient} from '@tanstack/react-query';
import {usePackages} from '@/hooks/use-packages';
import {useReleases} from '@/hooks/use-releases';
import {ExtendedPackage} from '@/types/package';
import {Release} from '@/types/release';
import {useToast} from '@/hooks/use-toast';
import {downloadRelease} from '@/lib/api/releases';
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
import {iconOptions} from '@/lib/utils';
import {ProjectDialog} from '@/components/project';
import {Projects} from '@/components/projects.tsx';
import {Packages} from '@/components/packages.tsx';
import {Releases} from '@/components/releases.tsx';
import {useLocation, useSearchParams} from 'react-router-dom';
import {PackageReleaseDialog} from "@/components/package-release-dialog.tsx";
import {PackageCreateDialog} from "@/components/package-create-dialog.tsx";

// Hierarchy Page Component
export default function HierarchyPage() {
    const {toast} = useToast();
    const [searchParams] = useSearchParams();
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

    const {data: projects} = useProjects();
    const createProject = useCreateProject();
    const updateProject = useUpdateProject();
    const queryClient = useQueryClient();
    const {data: packagesData} = usePackages({
        projectId: selectedProjectId || undefined
    });
    const packages: ExtendedPackage[] = packagesData?.data || [];

    const selectedProject = projects?.find(p => p.id === selectedProjectId);
    const selectedPackage = packages.find(p => p.id === selectedPackageId);

    // Fetch releases data from API
    const { data: releasesData } = useReleases(selectedPackageId || undefined);
    const releases: Release[] = releasesData?.data || [];

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

    const handleDownload = async (release: Release) => {
        try {
            toast({
                title: '下载开始',
                description: `正在准备下载 ${release.fileName}`,
            });

            const blob = await downloadRelease(release.id);
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = release.fileName;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast({
                title: '下载完成',
                description: `${release.fileName} 下载完成`,
            });
        } catch (error) {
            console.error('Download failed:', error);
            toast({
                variant: 'destructive',
                title: '下载失败',
                description: '文件下载失败，请重试',
            });
        }
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

    const handlePackageCreateSuccess = () => {
        // Invalidate packages queries to refresh the list
        queryClient.invalidateQueries({queryKey: ['packages']});
    };

    const handleCreateReleaseDialogClose = () => {
        setIsCreateReleaseDialogOpen(false);
    };

    const handleReleaseUploadSuccess = () => {
        // Invalidate releases queries to refresh the list
        queryClient.invalidateQueries({ queryKey: ['releases'] });
        console.log('Release uploaded successfully');
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

    // Handle URL parameters to auto-select project
    useEffect(() => {
        const projectId = searchParams.get('projectId');
        if (projectId && projects) {
            const project = projects.find(p => p.id === projectId);
            if (project) {
                setSelectedProjectId(projectId);
                setSelectedPackageId(null);
            }
        }
    }, [searchParams, projects]);

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
                isLoading={updateProject.isPending}
            />

            {/* Package Dialog */}
            <PackageCreateDialog
                open={isCreatePackageDialogOpen}
                onClose={handleCreatePackageDialogClose}
                projectID={selectedProjectId || ''}
                onSuccess={handlePackageCreateSuccess}
            />

            {/* Release Dialog */}
            {selectedPackage && (
                <PackageReleaseDialog
                    open={isCreateReleaseDialogOpen}
                    onClose={handleCreateReleaseDialogClose}
                    onSuccess={handleReleaseUploadSuccess}
                    packageId={selectedPackage.id}
                    packageName={selectedPackage.name}
                    packageType={selectedPackage.type}
                />
            )}
        </div>
    );
}