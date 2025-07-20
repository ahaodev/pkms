import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Project} from '@/types/simplified';
import * as ProjectsAPI from '@/lib/api/projects';
import {useAuth} from '@/providers/auth-provider.tsx';
import {ACCESS_TOKEN} from "@/types/constants.ts";

export const useProjects = () => {
    const {user} = useAuth();

    return useQuery({
        queryKey: ['projects', user?.id],
        queryFn: async () => {
            const response = await ProjectsAPI.getProjects();
            return response.data.map(ProjectsAPI.transformProjectFromBackend);
        },
        enabled: !!user && !!localStorage.getItem(ACCESS_TOKEN), // 只有用户存在且有token时才执行
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    });
};

export const useCreateProject = () => {
    const queryClient = useQueryClient();
    const {user, isAdmin} = useAuth();

    function assignProjectToUser(userId: string, projectId: string) {
        console.log(userId, projectId);
    }

    return useMutation({
        mutationFn: async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'packageCount' | 'createdBy'>) => {
            const projectData = {
                ...project,
                createdBy: user?.id || '',
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
