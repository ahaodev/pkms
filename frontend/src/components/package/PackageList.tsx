import { Package } from '@/types/simplified';
import { PackageGridCard } from './PackageGridCard';
import { PackageListItem } from './PackageListItem';

interface PackageListProps {
  displayPackages: Package[];
  viewMode: 'grid' | 'list';
  isFiltering: boolean;
  getVersionCount: (pkg: Package) => number;
  getTypeIcon: (type: Package['type']) => React.ReactNode;
  formatFileSize: (bytes: number) => string;
  handleVersionHistory: (pkg: Package) => void;
  handleShare: (pkg: Package) => void;
  handleDelete: (pkg: Package) => void;
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
            formatFileSize={formatFileSize}
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
