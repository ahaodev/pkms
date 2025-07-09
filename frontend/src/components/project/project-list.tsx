import { Package } from 'lucide-react';
import { Project } from '@/types/simplified';
import { ProjectCard } from './project-card';
import { ProjectListItem } from './project-list-item';

interface ProjectListProps {
  projects: Project[];
  viewMode: 'grid' | 'list';
  searchTerm: string;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onViewPackages: (project: Project) => void;
  getProjectIcon: (iconType: string) => JSX.Element;
}

export function ProjectList({ 
  projects, 
  viewMode, 
  searchTerm, 
  onEdit, 
  onDelete, 
  onViewPackages,
  getProjectIcon 
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
          {searchTerm ? '未找到匹配的项目' : '暂无项目'}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {searchTerm ? '尝试调整搜索条件' : '开始创建您的第一个项目'}
        </p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewPackages={onViewPackages}
            getProjectIcon={getProjectIcon}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <ProjectListItem
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewPackages={onViewPackages}
          getProjectIcon={getProjectIcon}
        />
      ))}
    </div>
  );
}
