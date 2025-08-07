import {TenantCard} from './tenant-card';
import {Tenant} from '@/types/tenant';
import {EmptyList} from '@/components/ui/empty-list';
import {Building} from 'lucide-react';

interface TenantListProps {
    tenants: Tenant[];
    onEdit: (tenant: Tenant) => void;
    onDelete: (tenant: Tenant) => void;
    onViewUsers: (tenant: Tenant) => void;
}

export function TenantList({
                               tenants,
                               onEdit,
                               onDelete,
                               onViewUsers
                           }: TenantListProps) {
    if (tenants.length === 0) {
        return (
            <EmptyList
                icon={Building}
                title="暂无租户"
                description="开始创建第一个租户来管理用户和权限。"
            />
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tenants.map((tenant) => (
                <TenantCard
                    key={tenant.id}
                    tenant={tenant}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewUsers={onViewUsers}
                />
            ))}
        </div>
    );
}