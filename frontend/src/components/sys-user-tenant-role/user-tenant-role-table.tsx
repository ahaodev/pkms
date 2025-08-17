import React, { useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Trash2 } from 'lucide-react';
import type { UserTenantRole as UserTenantRoleType } from '@/types/user-tenant-role';

interface UserTenantRoleTableProps {
  groupedRoles: Record<string, UserTenantRoleType[]>;
  getTenantName: (tenantId: string) => string;
  getRoleName: (roleId: string) => string;
  getRoleCode: (roleId: string) => string;
  onRemoveRole: (role: UserTenantRoleType) => void;
  isRemoving: boolean;
}

export const UserTenantRoleTable: React.FC<UserTenantRoleTableProps> = ({
  groupedRoles,
  getTenantName,
  getRoleName,
  getRoleCode,
  onRemoveRole,
  isRemoving,
}) => {
  const handleRemoveRole = useCallback((role: UserTenantRoleType) => {
    onRemoveRole(role);
  }, [onRemoveRole]);

  if (Object.keys(groupedRoles).length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        该用户暂无角色分配
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedRoles).map(([tenantId, tenantRoles]) => (
        <div key={tenantId} className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <Badge variant="outline">
              {getTenantName(tenantId)}
            </Badge>
            <div className="h-px bg-border flex-1"></div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>角色名称</TableHead>
                <TableHead>角色代码</TableHead>
                <TableHead>分配时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenantRoles.map((role, index) => (
                <TableRow key={`${role.tenant_id}-${role.role_id}-${index}`}>
                  <TableCell className="font-medium">
                    {getRoleName(role.role_id)}
                  </TableCell>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm">
                      {getRoleCode(role.role_id)}
                    </code>
                  </TableCell>
                  <TableCell>
                    {new Date(role.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRole(role)}
                      disabled={isRemoving}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
};