import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {EmptyList} from '@/components/ui/empty-list';
import {ChevronRight, Edit, FolderOpen, Plus, Trash} from 'lucide-react';
import {useDeleteProject} from '@/hooks/use-projects';
import {toast} from 'sonner';
import {getProjectIcon} from '@/lib/utils';
import {useI18n} from '@/contexts/i18n-context';


interface ProjectsViewProps {
    projects: any[];
    searchTerm: string;
    handleProjectSelect: (projectId: string) => void;
    onCreateProject: () => void;
    onEditProject: (project: any) => void;
}

export function Projects({
                             projects,
                             searchTerm,
                             handleProjectSelect,
                             onCreateProject,
                             onEditProject
                         }: ProjectsViewProps) {
    const { t } = useI18n();
    const deleteProject = useDeleteProject();

    // Filter projects based on search term
    const filteredProjects = projects?.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleDeleteProject = async (project: any) => {
        if (project.packageCount > 0) {
            toast.error(t('project.deleteError'), {
                description: t('project.deleteErrorDescription'),
            });
            return;
        }

        if (window.confirm(t('project.deleteConfirm', { name: project.name }))) {
            try {
                await deleteProject.mutateAsync(project.id);
                toast.success(t('project.deleteSuccess'), {
                    description: t('project.deleteSuccessDescription', { name: project.name }),
                });
            } catch (error) {
                toast.error(t('project.deleteError'), {
                    description: t('project.deleteFailedDescription'),
                });
            }
        }
    };
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    {t('project.list')}
                </h2>
                <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{filteredProjects.length} {t('project.count')}</Badge>
                    <Button onClick={onCreateProject}>
                        <Plus className="mr-2 h-4 w-4"/>
                        {t('project.newProject')}
                    </Button>
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {filteredProjects.map((project) => (
                    <Card
                        key={project.id}
                        className="cursor-pointer hover:shadow-md transition-shadow relative group"
                    >
                        <div onClick={() => handleProjectSelect(project.id)}>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-3">
                                    {getProjectIcon(project.icon || 'package2', "h-5 w-5")}
                                    <span>{project.name}</span>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto"/>
                                </CardTitle>
                                <CardDescription>{project.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">{t('project.packageCount')}</span>
                                    <Badge variant="outline">{project.packageCount || 0}</Badge>
                                </div>
                            </CardContent>
                        </div>
                        <div
                            className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditProject(project);
                                }}
                            >
                                <Edit className="h-4 w-4"/>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProject(project);
                                }}
                                disabled={deleteProject.isPending}
                            >
                                <Trash
                                    className={`h-4 w-4 ${project.packageCount > 0 ? 'text-gray-400' : 'text-red-500'}`}/>
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {filteredProjects.length === 0 && (
                <EmptyList
                    icon={FolderOpen}
                    title={searchTerm ? t('project.noProjectsFound') : t('project.noProjects')}
                />
            )}
        </div>
    );
}

