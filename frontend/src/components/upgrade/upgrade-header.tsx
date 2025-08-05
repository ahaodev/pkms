import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

interface UpgradeHeaderProps {
  onCreateClick: () => void;
}

export function UpgradeHeader({ onCreateClick }: UpgradeHeaderProps) {
  return (
    <PageHeader
      title="升级管理"
      description="管理软件包的升级目标，为客户端提供版本检查和下载服务"
      action={{
        label: "创建升级目标",
        onClick: onCreateClick,
        icon: Plus
      }}
    />
  );
}