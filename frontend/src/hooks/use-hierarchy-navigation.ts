import {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useAllProjects} from '@/hooks/use-projects';
import {usePackages} from '@/hooks/use-packages';
import {useReleasesWithPagination} from '@/hooks/use-releases';
import {downloadRelease} from '@/lib/api/releases';
import {toast} from 'sonner';
import {Release} from '@/types/release';
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
    const projects = projectsData || [];
    const packages = packagesData?.data || [];
    const releases = releasesData?.list || [];
    const selectedProject = projects.find(p => p.id === selectedProjectId);
    const selectedPackage = packages.find(p => p.id === selectedPackageId);
    
    // Debug logging
    console.log('useHierarchyNavigation - packagesData:', packagesData);
    console.log('useHierarchyNavigation - packages array:', packages);
    console.log('useHierarchyNavigation - selectedProjectId:', selectedProjectId);
    console.log('useHierarchyNavigation - selectedPackageId:', selectedPackageId);

    const handleProjectSelect = (projectId: string) => {
        console.log('handleProjectSelect called with projectId:', projectId);
        console.log('current selectedProjectId:', selectedProjectId);
        
        if (selectedProjectId === projectId) {
            setSelectedProjectId(null);
            setSelectedPackageId(null);
        } else {
            setSelectedProjectId(projectId);
            setSelectedPackageId(null);
        }
        
        console.log('after update - selectedProjectId should be:', projectId);
    };

    const handlePackageSelect = (packageId: string) => {
        setSelectedPackageId(packageId);
        setReleasesCurrentPage(1); // 切换包时重置发布页码
    };

    const resetToProjects = () => {
        setSelectedProjectId(null);
        setSelectedPackageId(null);
        setReleasesCurrentPage(1);
    };

    const backToProject = () => {
        setSelectedPackageId(null);
        setReleasesCurrentPage(1);
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
        } catch (error) {
            console.error(error)
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