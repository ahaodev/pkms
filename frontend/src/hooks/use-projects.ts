import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Project} from '@/types/simplified';
import * as ProjectsAPI from '@/lib/api/projects';
import {useAuth} from '@/contexts/simple-auth-context';
import {mockProjects} from '@/data/simplified-mock';

// 根据环境变量选择使用真实API还是模拟数据
const useRealApi = import.meta.env.VITE_USE_REAL_API === 'true';

export const useProjects = () => {
    const {user, isAdmin, canAccessProject} = useAuth();
    
    return useQuery({
        queryKey: ['projects', user?.id],
        queryFn: async () => {
            if (useRealApi) {
                const response = await ProjectsAPI.getProjects();
                return response.data.map(ProjectsAPI.transformProjectFromBackend);
            } else {
                return mockProjects;
            }
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
            if (useRealApi) {
                const response = await ProjectsAPI.getProject(id);
                return ProjectsAPI.transformProjectFromBackend(response.data);
            } else {
                const project = mockProjects.find(p => p.id === id);
                if (!project) throw new Error('Project not found');
                return project;
            }
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

            if (useRealApi) {
                const response = await ProjectsAPI.createProject(projectData);
                return ProjectsAPI.transformProjectFromBackend(response.data);
            } else {
                const newProject: Project = {
                    ...projectData,
                    id: Date.now().toString(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    packageCount: 0
                };
                return newProject;
            }
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
            if (useRealApi) {
                const response = await ProjectsAPI.updateProject(id, update);
                return ProjectsAPI.transformProjectFromBackend(response.data);
            } else {
                const project = mockProjects.find(p => p.id === id);
                if (!project) throw new Error('Project not found');
                return { ...project, ...update, updatedAt: new Date() };
            }
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
            if (useRealApi) {
                await ProjectsAPI.deleteProject(id);
            } else {
                // Mock delete - just return success
                return Promise.resolve();
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['projects']});
        },
    });
};
