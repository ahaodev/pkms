import {Clock, Download, Share2, Trash2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader} from '@/components/ui/card';
import {Release} from '@/types/simplified';

interface PackageVersionCardProps {
  release: Release;
  onDownload: (release: Release) => void;
  onShare: (version: Release) => void;
  onDelete: (version: Release) => void;
}

export function PackageVersionCard({
  release,
  onDownload,
  onShare,
  onDelete
}: PackageVersionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-sm text-muted-foreground">
              <Clock className="inline h-4 w-4 mr-1" />
              {release.createdAt.toLocaleDateString('zh-CN', {
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(release)}
            >
              <Download className="h-4 w-4 mr-1" />
              下载
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare(release)}
            >
              <Share2 className="h-4 w-4 mr-1" />
              分享
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(release)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              删除
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">下载次数</span>
              <span className="font-medium">{3}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
