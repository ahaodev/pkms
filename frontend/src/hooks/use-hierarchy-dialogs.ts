import {useState} from 'react';
import {useCreateProject, useUpdateProject} from '@/hooks/use-projects';
import {useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';

interface ProjectFormData {
    name: string;
    description: string;
    icon: string;
}

interface ProjectType {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export function useHierarchyDialogs() {
    const [projectFormData, setProjectFormData] = useState<ProjectFormData>({
        name: '',
        description: '',
        icon: 'package2'
    });
    const [editingProject, setEditingProject] = useState<ProjectType | null>(null);
    const [dialogs, setDialogs] = useState({
        createProject: false,
        editProject: false,
        createPackage: false,
        createRelease: false,
    });

    const createProject = useCreateProject();
    const updateProject = useUpdateProject();
    const queryClient = useQueryClient();

    const resetProjectForm = () => {
        setProjectFormData({name: '', description: '', icon: 'package2'});
    };

    const openDialog = (type: keyof typeof dialogs) => {
        setDialogs(prev => ({...prev, [type]: true}));
    };

    const closeDialog = (type: keyof typeof dialogs) => {
        setDialogs(prev => ({...prev, [type]: false}));
        if (type === 'createProject' || type === 'editProject') {
            resetProjectForm();
            setEditingProject(null);
        }
    };

    const handleCreateProject = async () => {
        try {
            await createProject.mutateAsync(projectFormData);
            toast.success('项目创建成功', {
                description: `项目 "${projectFormData.name}" 已成功创建。`,
            });
            closeDialog('createProject');
        } catch {
            toast.error('创建失败', {
                description: '项目创建失败，请重试。',
            });
        }
    };

    const handleEditProject = (project: ProjectType) => {
        setEditingProject(project);
        setProjectFormData({
            name: project.name,
            description: project.description,
            icon: project.icon
        });
        openDialog('editProject');
    };

    const handleUpdateProject = async () => {
        if (!editingProject) return;
        
        try {
            await updateProject.mutateAsync({
                id: editingProject.id,
                update: projectFormData
            });
            toast.success('项目更新成功', {
                description: `项目 "${projectFormData.name}" 已成功更新。`,
            });
            closeDialog('editProject');
        } catch {
            toast.error('更新失败', {
                description: '项目更新失败，请重试。',
            });
        }
    };

    const handlePackageCreateSuccess = () => {
        queryClient.invalidateQueries({queryKey: ['packages']});
    };

    const handleReleaseUploadSuccess = () => {
        queryClient.invalidateQueries({queryKey: ['releases']});
    };

    return {
        dialogs,
        projectFormData,
        setProjectFormData,
        editingProject,
        openDialog,
        closeDialog,
        handleCreateProject,
        handleEditProject,
        handleUpdateProject,
        handlePackageCreateSuccess,
        handleReleaseUploadSuccess,
        isCreatingProject: createProject.isPending,
        isUpdatingProject: updateProject.isPending,
    };
}