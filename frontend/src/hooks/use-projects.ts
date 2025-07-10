import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Project} from '@/types/simplified';
import * as ProjectsAPI from '@/lib/api/projects';
import {useAuth} from '@/contexts/simple-auth-context';

export const useProjects = () => {
    const {user, isAdmin, canAccessProject} = useAuth();
    
    return useQuery({
        queryKey: ['projects', user?.id],
        queryFn: async () => {
            const response = await ProjectsAPI.getProjects();
            return response.data.map(ProjectsAPI.transformProjectFromBackend);
        },
        select: (projects: Project[]) => {
            if (!user || !projects) return [];
            
            // 管理员可以看到所有项目
            if (isAdmin()) {
                return projects;
            }
            
            // 普通用户只能看到有权限的项目
            return projects.filter((project: Project) => 
                canAccessProject(project.id) || 
                project.createdBy === user.id || 
                project.isPublic
            );
        },
    });
};

export const useProject = (id: string) => {
    return useQuery({
        queryKey: ['project', id],
        queryFn: async () => {
            const response = await ProjectsAPI.getProject(id);
            return ProjectsAPI.transformProjectFromBackend(response.data);
        },
        enabled: !!id,
    });
};

export const useCreateProject = () => {
    const queryClient = useQueryClient();
    const {user, isAdmin, assignProjectToUser} = useAuth();

    return useMutation({
        mutationFn: async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'packageCount' | 'createdBy' | 'isPublic'>) => {
            const projectData = {
                ...project,
                createdBy: user?.id || '',
                isPublic: false // 新项目默认不公开
            };

            const response = await ProjectsAPI.createProject(projectData);
            return ProjectsAPI.transformProjectFromBackend(response.data);
        },
        onSuccess: async (project) => {
            // 如果是普通用户创建的项目，自动分配给自己
            if (user && !isAdmin() && project.id) {
                await assignProjectToUser(user.id, project.id);
            }
            queryClient.invalidateQueries({queryKey: ['projects']});
        },
    });
};

export const useUpdateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({id, update}: { id: string; update: Partial<Project> }) => {
            const response = await ProjectsAPI.updateProject(id, update);
            return ProjectsAPI.transformProjectFromBackend(response.data);
        },
        onSuccess: (_, {id}) => {
            queryClient.invalidateQueries({queryKey: ['projects']});
            queryClient.invalidateQueries({queryKey: ['project', id]});
        },
    });
};

export const useDeleteProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await ProjectsAPI.deleteProject(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['projects']});
        },
    });
};
