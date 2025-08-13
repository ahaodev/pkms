import {FolderOpen} from 'lucide-react';
import {EmptyList} from '@/components/ui/empty-list';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Project} from '@/types/project.ts';
import {getProjectIcon} from '@/lib/utils';
import {useI18n} from '@/contexts/i18n-context';

interface RecentProjectsProps {
    projects?: Project[];
    onViewProject: (projectId: string) => void;
    onViewAllProjects: () => void;
}

export function RecentProjects({
                                   projects,
                                   onViewProject,
                                   onViewAllProjects
                               }: RecentProjectsProps) {
    const {t} = useI18n();
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("dashboard.recentProjects")}</CardTitle>
                <CardDescription>{t("dashboard.recentProjectsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
                {projects && projects.length > 0 ? (
                    <div className="space-y-3">
                        {projects.slice(0, 5).map((project) => (
                            <div
                                key={project.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-lg">{getProjectIcon(project.icon ?? 'other')}</span>
                                    <div>
                                        <p className="font-medium">{project.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {project.packageCount} {t("dashboard.packagesCount")}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onViewProject(project.id)}
                                >
                                    {t("dashboard.viewProject")}
                                </Button>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={onViewAllProjects}
                        >
                            {t("dashboard.viewAllProjects")}
                        </Button>
                    </div>
                ) : (
                    <EmptyList
                        icon={FolderOpen}
                        title={t("dashboard.noProjectsTitle")}
                        description={t("dashboard.noProjectsDesc")}
                        actionText={t("dashboard.createProject")}
                        onAction={onViewAllProjects}
                        showAction={true}
                        className="py-6"
                    />
                )}
            </CardContent>
        </Card>
    );
}
