import {useEffect, useState, useMemo} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useAllProjects} from '@/hooks/use-projects';
import {usePackages} from '@/hooks/use-packages';
import {useReleasesWithPagination} from '@/hooks/use-releases';
import {downloadRelease} from '@/lib/api/releases';
import {toast} from 'sonner';
import {Release} from '@/types/release';
import {Project} from '@/types/project';
import {Package} from '@/types/package';
import {useI18n} from '@/contexts/i18n-context';

export function useHierarchyNavigation() {
    const { t } = useI18n();
    const [searchParams] = useSearchParams();
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [releasesCurrentPage, setReleasesCurrentPage] = useState(1);
    const [releasesPageSize] = useState(10);

    const {data: projectsData, isLoading: projectsLoading} = useAllProjects();
    const {data: packagesData, isLoading: packagesLoading} = usePackages({
        projectId: selectedProjectId || undefined
    });
    const {data: releasesData, isLoading: releasesLoading} = useReleasesWithPagination(
        selectedPackageId || undefined, 
        releasesCurrentPage, 
        releasesPageSize
    );

    // Normalize shapes: projectsData is an array from useAllProjects, packagesData already exposes .data array,
    // releasesData is a PagedResult. Convert to arrays expected by components.
    const projects = useMemo(() => projectsData || [], [projectsData]);
    const packages = packagesData?.data || [];
    const releases = releasesData?.list || [];
    const selectedProject = projects.find((p: Project) => p.id === selectedProjectId);
    const selectedPackage = packages.find((p: Package) => p.id === selectedPackageId);
    
    // Data ready for components

    const handleProjectSelect = (projectId: string) => {
        if (selectedProjectId === projectId) {
            setSelectedProjectId(null);
            setSelectedPackageId(null);
        } else {
            setSelectedProjectId(projectId);
            setSelectedPackageId(null);
        }
    };

    const handlePackageSelect = (packageId: string) => {
        setSelectedPackageId(packageId);
        setReleasesCurrentPage(1); // 切换包时重置发布页码
    };

    const resetToProjects = () => {
        console.log('🔄 resetToProjects() called - clearing both IDs');
        console.log('   - Current projectId before:', selectedProjectId);
        console.log('   - Current packageId before:', selectedPackageId);
        setSelectedProjectId(null);
        setSelectedPackageId(null);
        setReleasesCurrentPage(1);
        console.log('   - Both IDs set to null');
    };

    const backToProject = () => {
        console.log('🔄 backToProject() called - clearing packageId');
        console.log('   - Current packageId before:', selectedPackageId);
        setSelectedPackageId(null);
        setReleasesCurrentPage(1);
        console.log('   - setSelectedPackageId(null) called');
    };

    const handleDownload = async (release: Release) => {
        try {
            toast.info(t('hierarchy.downloadStarted'), {
                description: t('hierarchy.preparingDownload', { fileName: release.file_name }),
            });

            const blob = await downloadRelease(release.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = release.file_name;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success(t('hierarchy.downloadCompleted'), {
                description: t('hierarchy.downloadCompletedDescription', { fileName: release.file_name }),
            });
        } catch {
            toast.error(t('hierarchy.downloadFailed'), {
                description: t('hierarchy.downloadFailedDescription'),
            });
        }
    };

    const getSearchPlaceholder = () => {
        if (!selectedProjectId) return t('hierarchy.searchProjects');
        if (selectedProjectId && !selectedPackageId) return t('hierarchy.searchPackages');
        return t('hierarchy.searchReleases');
    };

    // Auto-select project from URL
    useEffect(() => {
        const projectId = searchParams.get('projectId');
        if (projectId && projects.length) {
            const project = projects.find(p => p.id === projectId);
            if (project) {
                setSelectedProjectId(projectId);
                setSelectedPackageId(null);
            }
        }
    }, [searchParams, projects]);

    return {
        selectedProjectId,
        selectedPackageId,
        selectedProject,
        selectedPackage,
    projects: projects,
        packages,
        releases,
        searchTerm,
        setSearchTerm,
        handleProjectSelect,
        handlePackageSelect,
        resetToProjects,
        backToProject,
        handleDownload,
        getSearchPlaceholder,
        // 发布版本分页相关
        releasesCurrentPage,
        setReleasesCurrentPage,
        releasesPageSize,
        releasesTotalCount: releasesData?.total || 0,
        releasesTotalPages: releasesData?.total_pages || 1,
        // Loading 状态 - 只在初始加载项目时显示全局loading
        isLoading: projectsLoading,
        projectsLoading,
        packagesLoading,
        releasesLoading,
    };
}