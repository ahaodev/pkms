import { Plus } from 'lucide-react';
import { PageAction } from '@/components/page';
import { PageHeader } from '@/components/page';
import { useI18n } from '@/contexts/i18n-context';

interface TenantHeaderProps {
    onCreateTenant: () => void;
}

export function TenantHeader({ onCreateTenant }: TenantHeaderProps) {
    const { t } = useI18n();
    
    const action: PageAction = {
        label: t('tenant.create'),
        onClick: onCreateTenant,
        icon: Plus
    };
    
    return (
        <PageHeader
            title={t('tenant.title')}
            description={t('tenant.description')}
            action={action}
        />
    );
}