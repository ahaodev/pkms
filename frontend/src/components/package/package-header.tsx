import { Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PackageHeaderProps {
  onCreateRelease?: () => void;
  onCreatePackage?: () => void;
}

export function PackageHeader({ onCreateRelease, onCreatePackage }: PackageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">包管理</h1>
        <p className="text-muted-foreground">管理您的软件包和发布版本</p>
      </div>
      <div className="flex items-center gap-2">
        {onCreatePackage && (
          <Button variant="outline" onClick={onCreatePackage}>
            <Plus className="mr-2 h-4 w-4" />
            创建包
          </Button>
        )}
        {onCreateRelease && (
          <Button onClick={onCreateRelease}>
            <Upload className="mr-2 h-4 w-4" />
            创建包
          </Button>
        )}
      </div>
    </div>
  );
}
