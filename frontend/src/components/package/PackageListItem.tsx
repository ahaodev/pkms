import { Download, Share2, Trash2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from '@/types/simplified';

interface PackageListItemProps {
  pkg: Package;
  getVersionCount: (pkg: Package) => number;
  getTypeIcon: (type: Package['type']) => React.ReactNode;
  formatFileSize: (bytes: number) => string;
  handleVersionHistory: (pkg: Package) => void;
  handleShare: (pkg: Package) => void;
  handleDelete: (pkg: Package) => void;
}

export const PackageListItem = ({ 
  pkg, 
  getVersionCount, 
  getTypeIcon, 
  formatFileSize,
  handleVersionHistory,
  handleShare,
  handleDelete
}: PackageListItemProps) => {
  const versionCount = getVersionCount(pkg);
  const hasMultipleVersions = versionCount > 1;

  return (
    <Card key={pkg.id} className="hover:shadow-md transition-shadow">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center">{getTypeIcon(pkg.type)}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">{pkg.name}</h3>
                <span className="text-sm text-muted-foreground">
                  v{pkg.version}
                </span>
                {hasMultipleVersions && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVersionHistory(pkg)}
                    className="p-1 h-auto"
                  >
                    <Badge variant="secondary" className="text-xs">
                      {versionCount} 版本
                      <History className="ml-1 h-3 w-3" />
                    </Badge>
                  </Button>
                )}
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-xs">{pkg.type}</Badge>
                  {pkg.isPublic && <Badge variant="outline" className="text-xs">公开</Badge>}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {pkg.description}
              </p>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                <span>大小: {formatFileSize(pkg.fileSize)}</span>
                <span>下载: {pkg.downloadCount}</span>
                <span>创建: {pkg.createdAt.toLocaleDateString()}</span>
                {hasMultipleVersions && (
                  <span>版本: {versionCount} 个</span>
                )}
              </div>
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
