import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {FolderOpen, ChevronRight, Plus} from 'lucide-react';

export function ProjectsView({
    filteredProjects,
    searchTerm,
    handleProjectSelect,
    onCreateProject
}: {
    filteredProjects: any[];
    searchTerm: string;
    handleProjectSelect: (projectId: string) => void;
    onCreateProject: () => void;
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold">选择项目</h2>
                <Badge variant="secondary">{filteredProjects.length} 个项目</Badge>
                <Button variant="outline" onClick={onCreateProject}>
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
    );
}

