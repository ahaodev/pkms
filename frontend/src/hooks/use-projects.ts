import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Project} from '@/types/simplified';
import {MockProjectService} from '@/services/implementations/simplified-mock.service';
import {useAuth} from '@/contexts/simple-auth-context';

const projectService = new MockProjectService();

export const useProjects = () => {
    const {user, isAdmin, canAccessProject} = useAuth();
    
    return useQuery({
        queryKey: ['projects', user?.id],
        queryFn: () => projectService.getProjects(),
        select: (response) => {
            if (!user) return [];
            
            // 管理员可以看到所有项目
            if (isAdmin()) {
                return response.data;
            }
            
            // 普通用户只能看到有权限的项目
            return response.data.filter(project => 
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
        queryFn: () => projectService.getProject(id),
        select: (response) => response.data,
        enabled: !!id,
    });
};

export const useCreateProject = () => {
    const queryClient = useQueryClient();
    const {user, isAdmin, assignProjectToUser} = useAuth();

    return useMutation({
        mutationFn: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'packageCount' | 'createdBy' | 'isPublic'>) =>
            projectService.createProject({
                ...project,
                createdBy: user?.id || '',
                isPublic: false // 新项目默认不公开
            }),
        onSuccess: async (response) => {
            // 如果是普通用户创建的项目，自动分配给自己
            if (user && !isAdmin() && response.data.id) {
                await assignProjectToUser(user.id, response.data.id);
            }
            queryClient.invalidateQueries({queryKey: ['projects']});
        },
    });
};

export const useUpdateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, update}: { id: string; update: Partial<Project> }) =>
            projectService.updateProject(id, update),
        onSuccess: (_, {id}) => {
            queryClient.invalidateQueries({queryKey: ['projects']});
            queryClient.invalidateQueries({queryKey: ['project', id]});
        },
    });
};

export const useDeleteProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => projectService.deleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['projects']});
        },
    });
};
