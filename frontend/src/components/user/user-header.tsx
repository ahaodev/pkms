import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/page';
import { useI18n } from '@/contexts/i18n-context';

interface UserHeaderProps {
  onCreateUser: () => void;
}

export function UserHeader({ onCreateUser }: UserHeaderProps) {
  const { t } = useI18n();
  
  return (
    <PageHeader
      title={t('user.title')}
      description={t('user.description')}
      action={{
        label: t('user.addUser'),
        onClick: onCreateUser,
        icon: Plus
      }}
    />
  );
}
