import {useMemo} from 'react';
import {Activity, FolderOpen, Package as PackageIcon} from 'lucide-react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select.tsx';
import {Project} from '@/types/project.ts';
import {ExtendedPackage} from '@/types/package.ts';
import {useI18n} from '@/contexts/i18n-context';

interface ProjectPackageFiltersProps {
    projectFilter: string;
    packageFilter: string;
    totalCount: number;
    countLabel: string; // 如："个升级目标" 或 "个接入配置"
    projects: Project[];
    packages: ExtendedPackage[];
    onProjectFilterChange: (value: string) => void;
    onPackageFilterChange: (value: string) => void;
}

export function ProjectPackageFilters({
                                          projectFilter,
                                          packageFilter,
                                          totalCount,
                                          countLabel,
                                          projects,
                                          packages,
                                          onProjectFilterChange,
                                          onPackageFilterChange
                                      }: ProjectPackageFiltersProps) {
    const { t } = useI18n();
    // Filter packages by selected project
    const filteredPackages = useMemo(() => {
        return projectFilter === 'all'
            ? packages
            : packages.filter(pkg => pkg.projectId === projectFilter);
    }, [packages, projectFilter]);

    return (
        <div className="flex flex-wrap gap-4">
            <Select value={projectFilter} onValueChange={onProjectFilterChange}>
                <SelectTrigger className="w-48">
                    <SelectValue placeholder={t('common.allProjects')}/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t('common.allProjects')}</SelectItem>
                    {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                            <div className="flex items-center space-x-2">
                                <FolderOpen className="h-4 w-4"/>
                                <span>{project.name}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={packageFilter}
                onValueChange={onPackageFilterChange}
                disabled={projectFilter !== 'all' && filteredPackages.length === 0}
            >
                <SelectTrigger className="w-48">
                    <SelectValue placeholder={t('common.allPackages')}/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t('common.allPackages')}</SelectItem>
                    {filteredPackages.map(pkg => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                            <div className="flex items-center space-x-2">
                                <PackageIcon className="h-4 w-4"/>
                                <span>{pkg.name}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="flex-1"/>

            <div className="flex items-center text-sm text-muted-foreground">
                <Activity className="mr-1 h-4 w-4"/>
                {t('common.total')} {totalCount} {countLabel}
            </div>
        </div>
    );
}