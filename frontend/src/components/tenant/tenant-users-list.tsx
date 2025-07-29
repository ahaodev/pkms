import { CheckCircle, XCircle, Trash2, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUpdateTenantUserRole, useRemoveUserFromTenant } from '@/hooks/use-tenants';
import { TenantUser } from '@/types/tenant';

interface TenantUsersListProps {
  tenantId: string;
  tenantUsers: TenantUser[] | undefined;
  isLoading: boolean;
}

const ROLES = [
  { value: 'admin', label: '系统管理员', color: 'bg-red-100 text-red-800' },
  { value: 'owner', label: '所有者', color: 'bg-blue-100 text-blue-800' },
  { value: 'user', label: '读写', color: 'bg-green-100 text-green-800' },
  { value: 'viewer', label: '只读', color: 'bg-gray-100 text-gray-800' },
];

export function TenantUsersList({ tenantId, tenantUsers, isLoading }: TenantUsersListProps) {
  const { toast } = useToast();
  const updateRoleMutation = useUpdateTenantUserRole();
  const removeUserMutation = useRemoveUserFromTenant();

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateRoleMutation.mutateAsync({
        tenantId,
        userId,
        role: newRole,
        isActive: true,
      });

      toast({
        title: '角色更新成功',
        description: '用户角色已更新。',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: '更新失败',
        description: '角色更新失败，请重试。',
      });
    }
  };

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (!confirm(`确定要从租户中移除用户 "${userName}" 吗？`)) {
      return;
    }

    try {
      await removeUserMutation.mutateAsync({
        tenantId,
        userId,
      });

      toast({
        title: '用户移除成功',
        description: '用户已从租户中移除。',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: '移除失败',
        description: '用户移除失败，请重试。',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">加载用户列表...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tenantUsers || tenantUsers.length === 0) {
    return (
      <div className="border rounded-lg">
        <div className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
            暂无用户
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            该租户还没有分配任何用户
          </p>
        </div>
      </div>
    );
  }

  // 对用户列表进行排序：admin 排在最前面，然后是 owner
  const sortedTenantUsers = [...tenantUsers].sort((a, b) => {
    const roleOrder = { admin: 0, owner: 1, user: 2, viewer: 3 };
    const aOrder = roleOrder[a.role as keyof typeof roleOrder] ?? 999;
    const bOrder = roleOrder[b.role as keyof typeof roleOrder] ?? 999;
    return aOrder - bOrder;
  });

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>用户名</TableHead>
            <TableHead>角色</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTenantUsers.map((user: TenantUser) => {
            const isProtectedUser = user.role === 'admin' || user.role === 'owner';
            const isAdmin = user.role === 'admin';

            return (
              <TableRow key={user.user_id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>
                  {isProtectedUser ? (
                    <Badge className={isAdmin ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}>
                      {isAdmin ? '系统管理员' : '所有者'}
                    </Badge>
                  ) : (
                    <Select
                      value={user.role}
                      onValueChange={(newRole) => handleUpdateRole(user.user_id, newRole)}
                      disabled={updateRoleMutation.isPending}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.filter(role => role.value !== 'admin' && role.value !== 'owner').map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell>
                  {user.is_active ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      活跃
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      禁用
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  {!isProtectedUser && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUser(user.user_id, user.username)}
                      disabled={removeUserMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}