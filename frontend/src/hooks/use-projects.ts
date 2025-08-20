import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Project} from '@/types/project';
import * as ProjectsAPI from '@/lib/api/projects';
import {useAuth} from '@/providers/auth-provider.tsx';
import {ACCESS_TOKEN} from "@/types/constants.ts";

// 获取所有项目 (不分页，用于下拉框等)
export const useAllProjects = () => {
    const {user} = useAuth();

    return useQuery({
        queryKey: ['all-projects', user?.id],
        queryFn: async () => {
            const response = await ProjectsAPI.getAllProjects();
            return response.data; // 已经经过转换的 Project[]
        },
        enabled: !!user && !!localStorage.getItem(ACCESS_TOKEN),
    });
};

export const useCreateProject = () => {
    const queryClient = useQueryClient();
    const {user} = useAuth();

    function assignProjectToUser(_userId: string, _projectId: string) {
        console.log(_userId,_projectId)
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
            assignProjectToUser(`${user?.id}`, project.id);
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
