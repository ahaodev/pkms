import {useState} from 'react';
import {useCreateProject, useUpdateProject} from '@/hooks/use-projects';
import {useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';
import {useI18n} from '@/contexts/i18n-context';
import {Project} from '@/types/project';

interface ProjectFormData {
    name: string;
    description: string;
    icon: string;
}


export function useHierarchyDialogs() {
    const {t} = useI18n();
    const [projectFormData, setProjectFormData] = useState<ProjectFormData>({
        name: '',
        description: '',
        icon: 'package2'
    });
    const [editingProject, setEditingProject] = useState<Project | null>(null);
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
            toast.success(t('project.createSuccess'), {
                description: t('project.createSuccessDescription', { name: projectFormData.name }),
            });
            closeDialog('createProject');
        } catch {
            toast.error(t('project.createError'), {
                description: t('project.createFailedDescription'),
            });
        }
    };

    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setProjectFormData({
            name: project.name,
            description: project.description,
            icon: project.icon || 'package2'
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
            toast.success(t('project.updateSuccess'), {
                description: t('project.updateSuccessDescription', { name: projectFormData.name }),
            });
            closeDialog('editProject');
        } catch {
            toast.error(t('common.updateError'), {
                description: t('project.updateFailedDescription'),
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