import {Pencil, Trash2, Users} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Tenant} from '@/types/tenant';
import {useI18n} from '@/contexts/i18n-context';

interface TenantCardProps {
    tenant: Tenant;
    onEdit: (tenant: Tenant) => void;
    onDelete: (tenant: Tenant) => void;
    onViewUsers: (tenant: Tenant) => void;
}

export function TenantCard({
                               tenant,
                               onEdit,
                               onDelete,
                               onViewUsers
                           }: TenantCardProps) {
    const { t } = useI18n();
    
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="text-2xl shrink-0">{tenant.name.charAt(0).toUpperCase()}</div>
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg truncate">{tenant.name}</CardTitle>
                            <CardDescription className="truncate">ID: {tenant.id}</CardDescription>
                        </div>
                    </div>
                    <div className="flex space-x-1 shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewUsers(tenant)}
                            title={t('tenant.viewUsers')}
                        >
                            <Users className="h-4 w-4"/>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(tenant)}
                            title={t('tenant.editTenant')}
                        >
                            <Pencil className="h-4 w-4"/>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(tenant)}
                            title={t('tenant.deleteTenant')}
                        >
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline">
                        {t('tenant.title')}
                    </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                    {t('user.createdAt')}：{tenant.created_at.toLocaleDateString()}
                </div>
            </CardContent>
        </Card>
    );
}