import {TenantCard} from './tenant-card';
import {Tenant} from '@/types/tenant';

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
            <div className="text-center py-12">
                <div className="mx-auto max-w-sm">
                    <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
                        暂无租户
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        开始创建第一个租户来管理用户和权限。
                    </p>
                </div>
            </div>
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