import { ExtendedPackage } from '@/types/simplified';
import { PackageGridCard } from './PackageGridCard';
import { PackageListItem } from './PackageListItem';

interface PackageListProps {
  displayPackages: ExtendedPackage[];
  viewMode: 'grid' | 'list';
  isFiltering: boolean;
  getVersionCount: (pkg: ExtendedPackage) => number;
  getTypeIcon: (type: ExtendedPackage['type']) => React.ReactNode;
  formatFileSize: (bytes: number) => string;
  handleVersionHistory: (pkg: ExtendedPackage) => void;
  handleShare: (pkg: ExtendedPackage) => void;
  handleDelete: (pkg: ExtendedPackage) => void;
}

export const PackageList = ({ 
  displayPackages, 
  viewMode, 
  isFiltering,
  getVersionCount,
  getTypeIcon,
  formatFileSize,
  handleVersionHistory,
  handleShare,
  handleDelete
}: PackageListProps) => (
  <div className={`transition-opacity duration-200 ${isFiltering ? 'opacity-50' : 'opacity-100'}`}>
    {viewMode === 'grid' ? (
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {displayPackages.map((pkg) => (
          <PackageGridCard 
            key={pkg.id} 
            pkg={pkg} 
            getVersionCount={getVersionCount}
            getTypeIcon={getTypeIcon}
            handleVersionHistory={handleVersionHistory}
            handleShare={handleShare}
            handleDelete={handleDelete}
          />
        ))}
      </div>
    ) : (
      <div className="space-y-2">
        {displayPackages.map((pkg) => (
          <PackageListItem 
            key={pkg.id} 
            pkg={pkg} 
            getVersionCount={getVersionCount}
            getTypeIcon={getTypeIcon}
            formatFileSize={formatFileSize}
            handleVersionHistory={handleVersionHistory}
            handleShare={handleShare}
            handleDelete={handleDelete}
          />
        ))}
      </div>
    )}
  </div>
);
