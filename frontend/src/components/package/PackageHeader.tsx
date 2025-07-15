import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PackageHeaderProps {
  onCreateRelease: () => void;
}

export function PackageHeader({ onCreateRelease }: PackageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">包管理</h1>
        <p className="text-muted-foreground">管理您的软件包和发布版本</p>
      </div>
      <Button onClick={onCreateRelease}>
        <Upload className="mr-2 h-4 w-4" />
        创建发布
      </Button>
    </div>
  );
}
