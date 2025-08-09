import {Tenant} from '@/types/tenant';
import {EmptyList} from '@/components/ui/empty-list';
import {Building, Edit, Trash2, Users, MoreHorizontal} from 'lucide-react';
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
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>租户名称</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead>更新时间</TableHead>
                        <TableHead className="text-right">操作</TableHead>
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
                                            <span className="sr-only">打开菜单</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onViewUsers(tenant)}>
                                            <Users className="mr-2 h-4 w-4" />
                                            查看用户
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEdit(tenant)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            编辑
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={() => onDelete(tenant)}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            删除
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