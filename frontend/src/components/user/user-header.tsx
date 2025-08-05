import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

interface UserHeaderProps {
  onCreateUser: () => void;
}

export function UserHeader({ onCreateUser }: UserHeaderProps) {
  return (
    <PageHeader
      title="用户管理"
      description="管理系统用户和权限分配"
      action={{
        label: "添加用户",
        onClick: onCreateUser,
        icon: Plus
      }}
    />
  );
}
