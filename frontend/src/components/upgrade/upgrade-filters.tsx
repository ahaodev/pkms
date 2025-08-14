import { FolderOpen, Package as PackageIcon, Activity } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project } from '@/types/project';
import { ExtendedPackage } from '@/types/package';
import { useI18n } from '@/contexts/i18n-context';

interface UpgradeFiltersProps {
  projectFilter: string;
  packageFilter: string;
  totalTargets: number;
  projects: Project[];
  packages: ExtendedPackage[];
  onProjectFilterChange: (value: string) => void;
  onPackageFilterChange: (value: string) => void;
}

export function UpgradeFilters({
  projectFilter,
  packageFilter,
  totalTargets,
  projects,
  packages,
  onProjectFilterChange,
  onPackageFilterChange
}: UpgradeFiltersProps) {
  const { t } = useI18n();
  
  // Filter packages by selected project
  const filteredPackages = projectFilter === 'all' 
    ? packages 
    : packages.filter(pkg => pkg.projectId === projectFilter);

  return (
    <div className="flex flex-wrap gap-4">
      <Select value={projectFilter} onValueChange={onProjectFilterChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder={t('common.allProjects')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('common.allProjects')}</SelectItem>
          {projects.map(project => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex items-center space-x-2">
                <FolderOpen className="h-4 w-4" />
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
          <SelectValue placeholder={t('common.allPackages')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('common.allPackages')}</SelectItem>
          {filteredPackages.map(pkg => (
            <SelectItem key={pkg.id} value={pkg.id}>
              <div className="flex items-center space-x-2">
                <PackageIcon className="h-4 w-4" />
                <span>{pkg.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex-1" />
      
      <div className="flex items-center text-sm text-muted-foreground">
        <Activity className="mr-1 h-4 w-4" />
        {t('common.total')} {totalTargets} {t('upgrade.targetsCount')}
      </div>
    </div>
  );
}