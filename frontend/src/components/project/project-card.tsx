import { Package, Calendar, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/types/simplified';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onViewPackages: (project: Project) => void;
  getProjectIcon: (iconType: string) => JSX.Element;
}

export function ProjectCard({ 
  project, 
  onEdit, 
  onDelete, 
  onViewPackages,
  getProjectIcon 
}: ProjectCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center">
            {getProjectIcon(project.icon || 'package2')}
          </div>
          <div>
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <CardDescription className="text-sm">
              {project.packageCount} 个包
            </CardDescription>
          </div>
        </div>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(project);
            }}
            title="编辑项目"
          >
            <Edit className="h-4 w-4" />
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
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {project.description}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center">
            <Package className="mr-1 h-3 w-3" />
            {project.packageCount} 个包
          </div>
          <div className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            {project.updatedAt.toLocaleDateString()}
          </div>
        </div>
        <Button 
          className="w-full mt-4" 
          variant="outline"
          onClick={() => onViewPackages(project)}
        >
          查看包
        </Button>
      </CardContent>
    </Card>
  );
}
