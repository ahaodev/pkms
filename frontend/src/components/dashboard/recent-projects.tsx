import {FolderOpen} from 'lucide-react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Project} from '@/types/project.ts';
import {getProjectIcon} from '@/lib/utils';

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
    return (
        <Card>
            <CardHeader>
                <CardTitle>最近项目</CardTitle>
                <CardDescription>最新创建或更新的项目</CardDescription>
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
                                            {project.packageCount} 个包
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onViewProject(project.id)}
                                >
                                    查看
                                </Button>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={onViewAllProjects}
                        >
                            查看所有项目
                        </Button>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2"/>
                        <p className="text-sm text-muted-foreground">暂无项目</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={onViewAllProjects}
                        >
                            创建项目
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
