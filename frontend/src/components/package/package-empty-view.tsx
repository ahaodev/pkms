import { Package } from 'lucide-react';

interface PackageEmptyViewProps {
  searchTerm?: string;
}

export function PackageEmptyView({ searchTerm }: PackageEmptyViewProps) {
  return (
    <div className="text-center py-12">
      <Package className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
        {searchTerm ? '未找到匹配的包' : '暂无包'}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {searchTerm ? '尝试调整搜索条件或筛选器' : '开始上传您的第一个包'}
      </p>
    </div>
  );
}
