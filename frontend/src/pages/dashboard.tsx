import {useCallback, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {useProjects} from '@/hooks/use-projects';
import {usePackages} from '@/hooks/use-packages';
import {Package} from '@/types/package.ts';
import {DashboardHeader, DashboardLoadingView, RecentProjects, StatsGrid,} from '@/components/dashboard';

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
    const navigateToHierarchy = useCallback((projectId?: string) => {
        navigate(projectId ? `/hierarchy?projectId=${projectId}` : '/hierarchy');
    }, [navigate]);

    const handleViewProject = useCallback((projectId: string) => {
        navigateToHierarchy(projectId);
    }, [navigateToHierarchy]);

    const handleViewAllProjects = useCallback(() => {
        navigateToHierarchy();
    }, [navigateToHierarchy]);

    if (projectsLoading || packagesLoading) {
        return <DashboardLoadingView/>;
    }

    return (
        <div className="space-y-6">
            {/* 页面头部 */}
            <DashboardHeader
                title="概览"
                description="包管理系统概览"
            />

            {/* 统计卡片 */}
            <StatsGrid stats={stats}/>

            {/* 最近项目 */}
            <RecentProjects
                projects={projects}
                onViewProject={handleViewProject}
                onViewAllProjects={handleViewAllProjects}
            />
        </div>
    );
}
