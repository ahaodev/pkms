import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {EmptyList} from '@/components/ui/empty-list';
import {Building2, ChevronRight, Edit, FolderOpen, Plus, Trash} from 'lucide-react';


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
    // Filter projects based on search term
    const filteredProjects = projects?.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    项目列表
                </h2>
                <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{filteredProjects.length} 个项目</Badge>
                    <Button onClick={onCreateProject}>
                        <Plus className="mr-2 h-4 w-4"/>
                        新建项目
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
                                    <Building2 className="h-5 w-5"/>
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
                                    if (window.confirm("确定要删除该项目吗？")) {
                                        console.log(`删除项目: ${project.id}`);
                                    }
                                }}
                            >
                                {project.packageCount == 0 ? <Trash className="h-4 w-4 text-red-500"/> : null}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {filteredProjects.length === 0 && (
                <EmptyList
                    icon={FolderOpen}
                    title={searchTerm ? '未找到匹配的项目' : '暂无项目'}
                />
            )}
        </div>
    );
}

