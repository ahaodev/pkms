import {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useProjects} from '@/hooks/use-projects';
import {usePackages} from '@/hooks/use-packages';
import {useReleases} from '@/hooks/use-releases';
import {downloadRelease} from '@/lib/api/releases';
import {toast} from 'sonner';
import {Release} from '@/types/release';

export function useHierarchyNavigation() {
    const [searchParams] = useSearchParams();
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const {data: projects} = useProjects();
    const {data: packagesData} = usePackages({
        projectId: selectedProjectId || undefined
    });
    const {data: releasesData} = useReleases(selectedPackageId || undefined);

    const packages = packagesData?.data || [];
    const releases = releasesData?.data || [];
    const selectedProject = projects?.find(p => p.id === selectedProjectId);
    const selectedPackage = packages.find(p => p.id === selectedPackageId);

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
    };

    const resetToProjects = () => {
        setSelectedProjectId(null);
        setSelectedPackageId(null);
    };

    const backToProject = () => {
        setSelectedPackageId(null);
    };

    const handleDownload = async (release: Release) => {
        try {
            toast.info('下载开始', {
                description: `正在准备下载 ${release.file_name}`,
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

            toast.success('下载完成', {
                description: `${release.file_name} 下载完成`,
            });
        } catch (error) {
            toast.error('下载失败', {
                description: '文件下载失败，请重试',
            });
        }
    };

    const getSearchPlaceholder = () => {
        if (!selectedProjectId) return '搜索项目...';
        if (selectedProjectId && !selectedPackageId) return '搜索包...';
        return '搜索历史发布版本...';
    };

    // Auto-select project from URL
    useEffect(() => {
        const projectId = searchParams.get('projectId');
        if (projectId && projects) {
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
        projects: projects || [],
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
    };
}