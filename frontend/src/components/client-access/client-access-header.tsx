import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

interface ClientAccessHeaderProps {
  onCreateClick: () => void;
}

export function ClientAccessHeader({ onCreateClick }: ClientAccessHeaderProps) {
  return (
    <PageHeader
      title="接入管理"
      description="管理客户端设备的接入凭证和访问权限"
      action={{
        label: "创建接入凭证",
        onClick: onCreateClick,
        icon: Plus
      }}
    />
  );
}