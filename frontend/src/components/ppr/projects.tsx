import {Badge} from '@/components/ui/badge.tsx';
import {Button} from '@/components/ui/button.tsx';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card.tsx';
import {EmptyList} from '@/components/empty-list.tsx';
import {ChevronRight, Edit, FolderOpen, Plus, Trash} from 'lucide-react';
import {useDeleteProject} from '@/hooks/use-projects.ts';
import {toast} from 'sonner';
import {getProjectIcon} from '@/lib/utils.tsx';
import {useI18n} from '@/contexts/i18n-context.tsx';
import {Project} from '@/types/project';
import {memo, useMemo, useCallback} from 'react';


interface ProjectsViewProps {
    projects: Project[];
    searchTerm: string;
    handleProjectSelect: (projectId: string) => void;
    onCreateProject: () => void;
    onEditProject: (project: Project) => void;
}

export const Projects = memo<ProjectsViewProps>(function Projects({
                             projects,
                             searchTerm,
                             handleProjectSelect,
                             onCreateProject,
                             onEditProject
                         }) {
    const {t} = useI18n();
    const deleteProject = useDeleteProject();

    // Filter projects based on search term
    const filteredProjects = useMemo(() => {
        if (!projects) return [];
        return projects.filter(project =>
            project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [projects, searchTerm]);

    const handleDeleteProject = useCallback(async (project: Project) => {
        if (project.packageCount > 0) {
            toast.error(t('project.deleteError'), {
                description: t('project.deleteErrorDescription'),
            });
            return;
        }

        if (window.confirm(t('project.deleteConfirm', {name: project.name}))) {
            try {
                await deleteProject.mutateAsync(project.id);
                toast.success(t('project.deleteSuccess'), {
                    description: t('project.deleteSuccessDescription', {name: project.name}),
                });
            } catch {
                toast.error(t('project.deleteError'), {
                    description: t('project.deleteFailedDescription'),
                });
            }
        }
    }, [deleteProject, t]);
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
                        className="cursor-pointer hover:shadow-md transition-shadow relative group focus-within:ring-2 focus-within:ring-primary"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleProjectSelect(project.id);
                            }
                        }}
                        aria-label={t('project.openProject', { name: project.name })}
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
                                aria-label={t('project.editProject', { name: project.name })}
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
                                disabled={deleteProject.isPending || project.packageCount > 0}
                                aria-label={project.packageCount > 0 
                                    ? t('project.cannotDeleteWithPackages', { name: project.name })
                                    : t('project.deleteProject', { name: project.name })
                                }
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
});

