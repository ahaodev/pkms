import { History, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package } from '@/types/simplified';
import { PackageVersionCard } from './package-version-card';

interface PackageVersionHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  package: Package | null;
  allVersions: Package[];
  visibleVersionsCount: number;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onDownload: (version: Package) => void;
  onShare: (version: Package) => void;
  onDelete: (version: Package) => void;
}

export function PackageVersionHistoryDialog({
  open,
  onClose,
  package: packageData,
  allVersions,
  visibleVersionsCount,
  isLoadingMore,
  onLoadMore,
  onDownload,
  onShare,
  onDelete
}: PackageVersionHistoryDialogProps) {
  if (!packageData) return null;

  const visibleVersions = allVersions.slice(0, visibleVersionsCount);
  const hasMore = visibleVersionsCount < allVersions.length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center">
            <History className="mr-2 h-5 w-5" />
            版本历史 - {packageData.name}
          </DialogTitle>
          <DialogDescription>
            查看 {packageData.name} 的所有版本历史记录
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="space-y-4 pr-2">
            {visibleVersions.map((version) => (
              <PackageVersionCard
                key={version.id}
                version={version}
                onDownload={onDownload}
                onShare={onShare}
                onDelete={onDelete}
              />
            ))}
            
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  className="w-full max-w-xs"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      加载中...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      加载更多版本 (还有 {allVersions.length - visibleVersionsCount} 个)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
