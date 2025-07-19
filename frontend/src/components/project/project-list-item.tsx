import {Package, Calendar, Edit, Trash2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Project} from '@/types/simplified';

interface ProjectListItemProps {
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
    onViewPackages: (project: Project) => void;
    getProjectIcon: (iconType: string) => JSX.Element;
}

export function ProjectListItem({
                                    project,
                                    onEdit,
                                    onDelete,
                                    onViewPackages,
                                    getProjectIcon
                                }: ProjectListItemProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center">
                            {getProjectIcon(project.icon || 'package2')}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                <h3 className="font-semibold">{project.name}</h3>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Package className="mr-1 h-3 w-3"/>
                                    {project.packageCount} 个包
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                {project.description}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="text-xs text-muted-foreground text-right">
                            <div className="flex items-center">
                                <Calendar className="mr-1 h-3 w-3"/>
                                {project.updatedAt.toLocaleDateString()}
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewPackages(project)}
                        >
                            查看包
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(project);
                            }}
                            title="编辑项目"
                        >
                            <Edit className="h-4 w-4"/>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(project);
                            }}
                            title="删除项目"
                        >
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
