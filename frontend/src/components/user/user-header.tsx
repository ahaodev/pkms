import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserHeaderProps {
  onCreateUser: () => void;
}

export function UserHeader({ onCreateUser }: UserHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">用户管理</h1>
        <p className="text-muted-foreground">管理系统用户和权限分配</p>
      </div>
      <Button onClick={onCreateUser}>
        <Plus className="mr-2 h-4 w-4" />
        添加用户
      </Button>
    </div>
  );
}
