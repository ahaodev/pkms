import {useMemo, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {useProjects} from '@/hooks/use-projects';
import {usePackages} from '@/hooks/use-packages';
import {Package} from '@/types/simplified';
import {
    DashboardHeader,
    DashboardLoadingView,
    StatsGrid,
    RecentProjects,
    RecentPackages
} from '@/components/dashboard';

/**
 * 仪表板页：展示项目、包、上传、下载等核心统计信息和最近动态
 */

export default function Dashboard() {
    const navigate = useNavigate();
    const {data: projects, isLoading: projectsLoading} = useProjects();
    const {data: packagesPage, isLoading: packagesLoading} = usePackages();
    // 兼容 PageResponse 返回结构
    const packages = useMemo(() => (Array.isArray(packagesPage) ? packagesPage : packagesPage?.data || []), [packagesPage]);

    // 使用 useMemo 优化统计数据计算
    const stats = useMemo(() => {
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);

        return {
            totalProjects: projects?.length || 0,
            totalPackages: packages.length,
            recentUploads: packages.filter((p: Package) => p.createdAt > dayAgo).length,
            totalDownloads: 0, // TODO: 需要从 Release 统计计算
        };
    }, [projects, packages]);

    // 使用 useCallback 优化导航函数
    const navigateToPackages = useCallback((projectId?: string) => {
        navigate(projectId ? `/packages?projectId=${projectId}` : '/packages');
    }, [navigate]);

    const navigateToProjects = useCallback(() => {
        navigate('/projects');
    }, [navigate]);

    const handleViewProject = useCallback((projectId: string) => {
        navigateToPackages(projectId);
    }, [navigateToPackages]);

    const handleViewAllProjects = useCallback(() => {
        navigateToProjects();
    }, [navigateToProjects]);

    const handleViewAllPackages = useCallback(() => {
        navigateToPackages();
    }, [navigateToPackages]);

    if (projectsLoading || packagesLoading) {
        return <DashboardLoadingView/>;
    }

    return (
        <div className="space-y-6">
            {/* 页面头部 */}
            <DashboardHeader
                title="仪表板"
                description="包管理系统概览"
            />

            {/* 统计卡片 */}
            <StatsGrid stats={stats}/>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* 最近项目 */}
                <RecentProjects
                    projects={projects}
                    onViewProject={handleViewProject}
                    onViewAllProjects={handleViewAllProjects}
                />

                {/* 最近包 */}
                <RecentPackages
                    packages={packages}
                    onViewAllPackages={handleViewAllPackages}
                />
            </div>
        </div>
    );
}
