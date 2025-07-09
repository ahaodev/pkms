import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/use-projects';
import { Project } from '@/types/simplified';
import { 
  ProjectHeader, 
  ProjectToolbar, 
  ProjectList, 
  ProjectDialog,
  getProjectIcon,
  iconOptions
} from '@/components/project';

/**
 * 项目管理页：支持项目的创建、编辑、删除、搜索、图标选择等操作，支持多视图切换
 */

export default function ProjectsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'package2'
  });

  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateProject = async () => {
    try {
      await createProject.mutateAsync(formData);
      toast({
        title: '项目创建成功',
        description: `项目 "${formData.name}" 已成功创建。`,
      });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '', icon: 'package2' });
    } catch {
      toast({
        variant: 'destructive',
        title: '创建失败',
        description: '项目创建失败，请重试。',
      });
    }
  };

  const handleEditProject = async () => {
    if (!editingProject) return;
    
    try {
      await updateProject.mutateAsync({
        id: editingProject.id,
        update: formData
      });
      toast({
        title: '项目更新成功',
        description: `项目 "${formData.name}" 已成功更新。`,
      });
      setIsEditDialogOpen(false);
      setEditingProject(null);
      setFormData({ name: '', description: '', icon: 'package2' });
    } catch {
      toast({
        variant: 'destructive',
        title: '更新失败',
        description: '项目更新失败，请重试。',
      });
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`确定要删除项目 "${project.name}" 吗？这将同时删除其中的所有包。`)) {
      return;
    }

    try {
      await deleteProject.mutateAsync(project.id);
      toast({
        title: '项目删除成功',
        description: `项目 "${project.name}" 已成功删除。`,
      });
    } catch {
      toast({
        variant: 'destructive',
        title: '删除失败',
        description: '项目删除失败，请重试。',
      });
    }
  };

  const handleEditProjectOpen = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      icon: project.icon || 'package2'
    });
    setIsEditDialogOpen(true);
  };

  const handleViewPackages = (project: Project) => {
    navigate(`/packages?projectId=${project.id}`);
  };

  const handleCreateDialogClose = () => {
    setIsCreateDialogOpen(false);
    setFormData({ name: '', description: '', icon: 'package2' });
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingProject(null);
    setFormData({ name: '', description: '', icon: 'package2' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <ProjectHeader onCreateProject={() => setIsCreateDialogOpen(true)} />

      {/* 工具栏 */}
      <ProjectToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 项目列表 */}
      <ProjectList
        projects={filteredProjects}
        viewMode={viewMode}
        searchTerm={searchTerm}
        onEdit={handleEditProjectOpen}
        onDelete={handleDeleteProject}
        onViewPackages={handleViewPackages}
        getProjectIcon={getProjectIcon}
      />

      {/* 创建项目对话框 */}
      <ProjectDialog
        open={isCreateDialogOpen}
        onClose={handleCreateDialogClose}
        onSubmit={handleCreateProject}
        title="创建新项目"
        formData={formData}
        setFormData={setFormData}
        iconOptions={iconOptions}
        getProjectIcon={getProjectIcon}
        isLoading={createProject.isPending}
      />

      {/* 编辑项目对话框 */}
      <ProjectDialog
        open={isEditDialogOpen}
        onClose={handleEditDialogClose}
        onSubmit={handleEditProject}
        title="编辑项目"
        isEdit={true}
        formData={formData}
        setFormData={setFormData}
        iconOptions={iconOptions}
        getProjectIcon={getProjectIcon}
        isLoading={updateProject.isPending}
      />
    </div>
  );
}
