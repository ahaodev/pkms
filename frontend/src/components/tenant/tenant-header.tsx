import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { useI18n } from '@/contexts/i18n-context';

interface TenantHeaderProps {
    onCreateTenant: () => void;
}

export function TenantHeader({ onCreateTenant }: TenantHeaderProps) {
    const { t } = useI18n();
    
    return (
        <PageHeader
            title={t('tenant.title')}
            description={t('tenant.description')}
            action={{
                label: t('tenant.create'),
                onClick: onCreateTenant,
                icon: Plus
            }}
        />
    );
}