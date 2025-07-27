import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ClientAccessHeaderProps {
  onCreateClick: () => void;
}

export function ClientAccessHeader({ onCreateClick }: ClientAccessHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">接入管理</h1>
        <p className="text-muted-foreground">
          管理客户端设备的接入凭证和访问权限
        </p>
      </div>
      <Button onClick={onCreateClick}>
        <Plus className="mr-2 h-4 w-4" />
        创建接入凭证
      </Button>
    </div>
  );
}