import {Tenant} from '@/types/tenant';
import {EmptyList} from '@/components/empty-list.tsx';
import {Building, Edit, Trash2, Users, MoreHorizontal} from 'lucide-react';
import {useI18n} from '@/contexts/i18n-context';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    const { t } = useI18n();
    
    if (tenants.length === 0) {
        return (
            <EmptyList
                icon={Building}
                title={t('tenant.noTenants')}
                description={t('tenant.createFirstTenant')}
            />
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('tenant.name')}</TableHead>
                        <TableHead>{t('common.createdAt')}</TableHead>
                        <TableHead>{t('common.updatedAt')}</TableHead>
                        <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tenants.map((tenant) => (
                        <TableRow key={tenant.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    {tenant.name}
                                </div>
                            </TableCell>
                            <TableCell>
                                {new Date(tenant.created_at).toLocaleString('zh-CN')}
                            </TableCell>
                            <TableCell>
                                {new Date(tenant.updated_at).toLocaleString('zh-CN')}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">{t('common.openMenu')}</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onViewUsers(tenant)}>
                                            <Users className="mr-2 h-4 w-4" />
                                            {t('tenant.viewUsers')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEdit(tenant)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            {t('common.edit')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={() => onDelete(tenant)}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {t('common.delete')}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}