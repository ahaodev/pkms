import { Clock, Download, Share2, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from '@/types/simplified';
import { formatFileSize } from './package-utils';

interface PackageVersionCardProps {
  version: Package;
  onDownload: (version: Package) => void;
  onShare: (version: Package) => void;
  onDelete: (version: Package) => void;
}

export function PackageVersionCard({
  version,
  onDownload,
  onShare,
  onDelete
}: PackageVersionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Badge variant={version.isLatest ? "default" : "secondary"} className="text-sm">
                v{version.version}
              </Badge>
              {version.isLatest && <Badge className="text-xs">最新</Badge>}
            </div>
            <div className="text-sm text-muted-foreground">
              <Clock className="inline h-4 w-4 mr-1" />
              {version.createdAt.toLocaleDateString('zh-CN', { 
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
              onClick={() => onDownload(version)}
            >
              <Download className="h-4 w-4 mr-1" />
              下载
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare(version)}
            >
              <Share2 className="h-4 w-4 mr-1" />
              分享
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(version)}
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
              <span className="text-muted-foreground">文件大小</span>
              <span className="font-medium">{formatFileSize(version.fileSize)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">下载次数</span>
              <span className="font-medium">{version.downloadCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">文件名</span>
              <span className="font-medium text-xs">{version.fileName}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">{version.type}</Badge>
              {version.isPublic && <Badge variant="outline" className="text-xs">公开</Badge>}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">校验和：</span>
              <span className="font-mono text-xs">{version.checksum}</span>
            </div>
          </div>
        </div>
        
        {version.changelog && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <div className="flex items-center mb-2">
              <FileText className="mr-2 h-4 w-4" />
              <span className="font-medium text-sm">更新日志</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{version.changelog}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
