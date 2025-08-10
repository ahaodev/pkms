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
import {Projects} from '@/components/projects.tsx';
import {Packages} from '@/components/packages.tsx';
import {Releases} from '@/components/releases.tsx';
import {ProjectDialog} from '@/components/project';
import {PackageReleaseDialog} from "@/components/package-release-dialog.tsx";
import {PackageCreateDialog} from "@/components/package-create-dialog.tsx";
import {iconOptions} from '@/lib/utils';
import {useHierarchyDialogs} from '@/hooks/use-hierarchy-dialogs';
import {useHierarchyNavigation} from '@/hooks/use-hierarchy-navigation';

export default function HierarchyPage() {
    const navigation = useHierarchyNavigation();
    const dialogs = useHierarchyDialogs();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">项目包管理</h1>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <Input
                    placeholder={navigation.getSearchPlaceholder()}
                    value={navigation.searchTerm}
                    onChange={(e) => navigation.setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="#" onClick={navigation.resetToProjects}>
                            项目
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {navigation.selectedProject && (
                        <>
                            <BreadcrumbSeparator/>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="#" onClick={navigation.backToProject}>
                                    {navigation.selectedProject.name}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            {navigation.selectedPackage && (
                                <>
                                    <BreadcrumbSeparator/>
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>{navigation.selectedPackage.name}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </>
                            )}
                        </>
                    )}
                </BreadcrumbList>
            </Breadcrumb>

            <div className="grid gap-6">
                {!navigation.selectedProjectId ? (
                    <Projects
                        projects={navigation.projects}
                        searchTerm={navigation.searchTerm}
                        handleProjectSelect={navigation.handleProjectSelect}
                        onCreateProject={() => dialogs.openDialog('createProject')}
                        onEditProject={dialogs.handleEditProject}
                    />
                ) : navigation.selectedProjectId && !navigation.selectedPackageId ? (
                    <Packages
                        selectedProject={navigation.selectedProject}
                        packages={navigation.packages}
                        searchTerm={navigation.searchTerm}
                        handlePackageSelect={navigation.handlePackageSelect}
                        onCreatePackage={() => dialogs.openDialog('createPackage')}
                    />
                ) : (
                    <Releases
                        selectedPackage={navigation.selectedPackage}
                        releases={navigation.releases}
                        searchTerm={navigation.searchTerm}
                        handleCreateRelease={() => dialogs.openDialog('createRelease')}
                        handleDownload={navigation.handleDownload}
                        onReleaseDeleted={dialogs.handleReleaseUploadSuccess}
                    />
                )}
            </div>

            <ProjectDialog
                open={dialogs.dialogs.createProject}
                onClose={() => dialogs.closeDialog('createProject')}
                onSubmit={dialogs.handleCreateProject}
                title="创建新项目"
                formData={dialogs.projectFormData}
                setFormData={dialogs.setProjectFormData}
                iconOptions={iconOptions}
                isLoading={dialogs.isCreatingProject}
            />

            <ProjectDialog
                open={dialogs.dialogs.editProject}
                onClose={() => dialogs.closeDialog('editProject')}
                onSubmit={dialogs.handleUpdateProject}
                title="编辑项目"
                isEdit={true}
                formData={dialogs.projectFormData}
                setFormData={dialogs.setProjectFormData}
                iconOptions={iconOptions}
                isLoading={dialogs.isUpdatingProject}
            />

            <PackageCreateDialog
                open={dialogs.dialogs.createPackage}
                onClose={() => dialogs.closeDialog('createPackage')}
                projectID={navigation.selectedProjectId || ''}
                onSuccess={dialogs.handlePackageCreateSuccess}
            />

            {navigation.selectedPackage && (
                <PackageReleaseDialog
                    open={dialogs.dialogs.createRelease}
                    onClose={() => dialogs.closeDialog('createRelease')}
                    onSuccess={dialogs.handleReleaseUploadSuccess}
                    packageId={navigation.selectedPackage.id}
                    packageName={navigation.selectedPackage.name}
                    packageType={navigation.selectedPackage.type}
                />
            )}
        </div>
    );
}