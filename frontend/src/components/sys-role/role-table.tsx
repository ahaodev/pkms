import React, { useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit } from 'lucide-react';
import { PermissionButton } from '@/components/permissions/permission-guard';
import type { Role } from '@/types/role';

interface RoleTableProps {
  roles: Role[];
  getTenantName: (tenantId?: string) => string;
  onEditRole: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
}

const RoleRow = React.memo<{
  role: Role;
  getTenantName: (tenantId?: string) => string;
  onEditRole: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
}>(({ role, getTenantName, onEditRole, onDeleteRole }) => {
  const handleEdit = useCallback(() => onEditRole(role), [onEditRole, role]);
  const handleDelete = useCallback(() => onDeleteRole(role), [onDeleteRole, role]);

  return (
    <TableRow>
      <TableCell className="font-medium">{role.name}</TableCell>
      <TableCell>
        <code className="px-2 py-1 bg-gray-100 rounded text-sm">
          {role.code}
        </code>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {getTenantName(role.tenant_id)}
        </Badge>
      </TableCell>
      <TableCell className="max-w-xs truncate">
        {role.description || '-'}
      </TableCell>
      <TableCell>
        {role.is_system ? (
          <Badge variant="secondary">系统角色</Badge>
        ) : (
          <Badge variant="outline">自定义</Badge>
        )}
      </TableCell>
      <TableCell>
        {role.is_active ? (
          <Badge variant="default" className="bg-green-500">
            活跃
          </Badge>
        ) : (
          <Badge variant="destructive">禁用</Badge>
        )}
      </TableCell>
      <TableCell>
        {new Date(role.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end space-x-2">
          <PermissionButton
            permission="role:update"
            variant="ghost"
            size="sm"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
          </PermissionButton>

          <PermissionButton
            permission="role:delete"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={role.is_system}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </PermissionButton>
        </div>
      </TableCell>
    </TableRow>
  );
});

RoleRow.displayName = 'RoleRow';

export const RoleTable: React.FC<RoleTableProps> = React.memo(({
  roles,
  getTenantName,
  onEditRole,
  onDeleteRole,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>角色名称</TableHead>
          <TableHead>角色代码</TableHead>
          <TableHead>所属租户</TableHead>
          <TableHead>描述</TableHead>
          <TableHead>类型</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>创建时间</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((role) => (
          <RoleRow
            key={role.id}
            role={role}
            getTenantName={getTenantName}
            onEditRole={onEditRole}
            onDeleteRole={onDeleteRole}
          />
        ))}
      </TableBody>
    </Table>
  );
});

RoleTable.displayName = 'RoleTable';