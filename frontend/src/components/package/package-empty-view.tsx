import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PackageEmptyViewProps {
  searchTerm?: string;
  onCreatePackage?: () => void;
}

export function PackageEmptyView({ searchTerm, onCreatePackage }: PackageEmptyViewProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md">
        <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-muted-foreground mb-2">
          {searchTerm ? '未找到匹配的包' : '暂无包'}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {searchTerm 
            ? '尝试调整搜索条件或筛选器，或者创建一个新的包' 
            : '开始创建您的第一个包，然后就可以发布版本了'
          }
        </p>
        {onCreatePackage && (
          <Button onClick={onCreatePackage} className="gap-2">
            <Plus className="h-4 w-4" />
            创建新包
          </Button>
        )}
      </div>
    </div>
  );
}
