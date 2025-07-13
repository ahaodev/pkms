import { Download, Share2, Trash2, FileText, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExtendedPackage } from '@/types/simplified';

interface PackageGridCardProps {
  pkg: ExtendedPackage;
  getVersionCount: (pkg: ExtendedPackage) => number;
  getTypeIcon: (type: ExtendedPackage['type']) => React.ReactNode;
  handleVersionHistory: (pkg: ExtendedPackage) => void;
  handleShare: (pkg: ExtendedPackage) => void;
  handleDelete: (pkg: ExtendedPackage) => void;
}

const PackageGridCard = ({ 
  pkg, 
  getVersionCount, 
  getTypeIcon, 
  handleVersionHistory,
  handleShare,
  handleDelete
}: PackageGridCardProps) => {
  const versionCount = getVersionCount(pkg);
  const hasMultipleVersions = versionCount > 1;

  return (
    <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2 min-w-0 flex-1">
            <div className="flex items-center justify-center flex-shrink-0">{getTypeIcon(pkg.type)}</div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg truncate">{pkg.name}</CardTitle>
              <CardDescription className="mt-1 flex items-center gap-2">
                {hasMultipleVersions && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVersionHistory(pkg)}
                    className="p-0 h-auto"
                  >
                    <Badge variant="secondary" className="text-xs">
                      {versionCount} 版本
                      <History className="ml-1 h-3 w-3" />
                    </Badge>
                  </Button>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex space-x-1 flex-shrink-0 ml-2">
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
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">
          {pkg.description}
        </p>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>创建时间</span>
            <span>{pkg.createdAt.toLocaleDateString()}</span>
          </div>
        </div>

        {pkg.changelog && (
          <div className="mt-3 p-2 bg-muted rounded text-xs">
            <div className="flex items-center mb-1">
              <FileText className="mr-1 h-3 w-3" />
              <span className="font-medium">更新日志</span>
            </div>
            <p>{pkg.changelog}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { PackageGridCard };
