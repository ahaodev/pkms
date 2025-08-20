import {useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {useDashboardData} from '@/hooks/use-dashboard';
import {useAllProjects} from '@/hooks/use-projects';
import {RecentProjects, RecentActivities, StatsGrid,} from '@/components/dashboard';
import {Page, PageHeader, PageContent} from "@/components/page";
import {useI18n} from "@/contexts/i18n-context";

/**
 * 仪表板页：展示项目、包、上传、下载等核心统计信息和最近动态
 */

export default function Dashboard() {
    const navigate = useNavigate();
    const {t} = useI18n();
    const {data: projects, isLoading: projectsLoading} = useAllProjects();
    const {stats, activities, isLoading: dashboardLoading, error: dashboardError} = useDashboardData();

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


    // 如果仪表板数据加载失败，显示错误信息但仍然显示项目数据
    if (dashboardError && process.env.NODE_ENV === 'development') {
        console.error('Dashboard data loading failed:', dashboardError);
    }

    return (
        <Page isLoading={projectsLoading || dashboardLoading}>
            <PageHeader
                title={t("dashboard.title")}
                description={t("dashboard.description")}
            />

            <PageContent>
                {/* 统计卡片 */}
                <StatsGrid stats={stats}/>

                {/* 最近项目 */}
                <RecentProjects
                    projects={projects}
                    onViewProject={handleViewProject}
                    onViewAllProjects={handleViewAllProjects}
                />

                {/* 最近活动 */}
                <RecentActivities
                    activities={activities}
                    isLoading={dashboardLoading}
                />
            </PageContent>
        </Page>
    );
}
