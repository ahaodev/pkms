import { Download, Share2, Trash2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExtendedPackage } from '@/types/simplified';

interface PackageListItemProps {
  pkg: ExtendedPackage;
  getVersionCount: (pkg: ExtendedPackage) => number;
  getTypeIcon: (type: ExtendedPackage['type']) => React.ReactNode;
  handleVersionHistory: (pkg: ExtendedPackage) => void;
  handleShare: (pkg: ExtendedPackage) => void;
  handleDelete: (pkg: ExtendedPackage) => void;
}

export const PackageListItem = ({ 
  pkg, 
  getVersionCount, 
  getTypeIcon, 
  handleVersionHistory,
  handleShare,
  handleDelete
}: PackageListItemProps) => {
  const versionCount = getVersionCount(pkg);

  return (
    <Card key={pkg.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleVersionHistory(pkg)}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center">{getTypeIcon(pkg.type)}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">{pkg.name}</h3>
                <span className="text-sm text-muted-foreground">
                  v{pkg.version || '1.0.0'}
                </span>
                <span className="text-xs text-muted-foreground ml-2">{versionCount} 版本</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {pkg.description}
              </p>

            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => window.open(`/api/packages/${pkg.id}/download`, '_blank')}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShare(pkg)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(pkg)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
