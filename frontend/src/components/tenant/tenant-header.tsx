import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

interface TenantHeaderProps {
    onCreateTenant: () => void;
}

export function TenantHeader({ onCreateTenant }: TenantHeaderProps) {
    return (
        <PageHeader
            title="租户管理"
            description="管理系统租户，分配用户和权限"
            action={{
                label: "创建租户",
                onClick: onCreateTenant,
                icon: Plus
            }}
        />
    );
}