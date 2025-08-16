import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/page-header.tsx';
import { useI18n } from '@/contexts/i18n-context';

interface ClientAccessHeaderProps {
  onCreateClick: () => void;
}

export function ClientAccessHeader({ onCreateClick }: ClientAccessHeaderProps) {
  const { t } = useI18n();

  return (
    <PageHeader
      title={t('clientAccess.management')}
      description={t('clientAccess.description')}
      action={{
        label: t('clientAccess.create'),
        onClick: onCreateClick,
        icon: Plus
      }}
    />
  );
}