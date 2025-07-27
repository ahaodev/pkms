import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface UpgradeHeaderProps {
  onCreateClick: () => void;
}

export function UpgradeHeader({ onCreateClick }: UpgradeHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">升级管理</h1>
        <p className="text-muted-foreground">
          管理软件包的升级目标，为客户端提供版本检查和下载服务
        </p>
      </div>
      <Button onClick={onCreateClick}>
        <Plus className="mr-2 h-4 w-4" />
        创建升级目标
      </Button>
    </div>
  );
}