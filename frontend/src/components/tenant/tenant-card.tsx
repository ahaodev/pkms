import {Pencil, Trash2, Users} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Tenant} from '@/types/tenant';

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
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="text-2xl flex-shrink-0">{tenant.name.charAt(0).toUpperCase()}</div>
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg truncate">{tenant.name}</CardTitle>
                            <CardDescription className="truncate">ID: {tenant.id}</CardDescription>
                        </div>
                    </div>
                    <div className="flex space-x-1 flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewUsers(tenant)}
                            title="查看用户"
                        >
                            <Users className="h-4 w-4"/>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(tenant)}
                            title="编辑租户"
                        >
                            <Pencil className="h-4 w-4"/>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(tenant)}
                            title="删除租户"
                        >
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline">
                        租户
                    </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                    创建于：{tenant.created_at.toLocaleDateString()}
                </div>
            </CardContent>
        </Card>
    );
}