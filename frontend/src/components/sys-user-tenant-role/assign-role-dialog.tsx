import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTenants } from '@/hooks/use-tenants';
import { useRoles } from '@/hooks/use-roles';
import { useAssignUserTenantRoles } from '@/hooks/use-user-tenant-role';
import type {
  AssignUserTenantRoleRequest,
  TenantRoleAssignment,
} from '@/types/user-tenant-role';

interface AssignRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess: () => void;
}

export const AssignRoleDialog: React.FC<AssignRoleDialogProps> = React.memo(({
  open,
  onOpenChange,
  userId,
  onSuccess,
}) => {
  const { data: tenants = [] } = useTenants();
  const { data: roles = [] } = useRoles();
  const assignRolesMutation = useAssignUserTenantRoles();

  const [tenantRoles, setTenantRoles] = useState<TenantRoleAssignment[]>([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // 使用 useMemo 优化查找函数
  const tenantMap = useMemo(() =>
    new Map(tenants.map(tenant => [tenant.id, tenant])), [tenants]
  );

  const roleMap = useMemo(() =>
    new Map(roles.map(role => [role.id, role])), [roles]
  );

  const getTenantName = useCallback((tenantId: string) => {
    return tenantMap.get(tenantId)?.name || tenantId;
  }, [tenantMap]);

  const getRoleName = useCallback((roleId: string) => {
    return roleMap.get(roleId)?.name || roleId;
  }, [roleMap]);

  // 获取指定租户的可用角色 - 优化
  const getAvailableRolesForTenant = useCallback((tenantId: string) => {
    return roles.filter((role) => role.tenant_id === tenantId || !role.tenant_id);
  }, [roles]);

  const availableRoles = useMemo(() =>
    selectedTenant ? getAvailableRolesForTenant(selectedTenant) : [],
    [selectedTenant, getAvailableRolesForTenant]
  );

  const handleAddAssignment = useCallback(() => {
    if (!selectedTenant || !selectedRole) return;

    // 检查是否已存在相同的分配
    const exists = tenantRoles.some(
      (assignment) =>
        assignment.tenant_id === selectedTenant && assignment.role_id === selectedRole
    );

    if (exists) {
      toast.error('该角色已分配');
      return;
    }

    const newAssignment: TenantRoleAssignment = {
      tenant_id: selectedTenant,
      role_id: selectedRole,
    };

    setTenantRoles(prev => [...prev, newAssignment]);
    setSelectedTenant('');
    setSelectedRole('');
  }, [selectedTenant, selectedRole, tenantRoles]);

  const handleRemoveAssignment = useCallback((index: number) => {
    setTenantRoles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (tenantRoles.length === 0) {
      toast.error('请至少添加一个角色分配');
      return;
    }

    const request: AssignUserTenantRoleRequest = {
      user_id: userId,
      tenant_roles: tenantRoles,
    };

    try {
      await assignRolesMutation.mutateAsync(request);
      toast.success('角色分配成功');
      setTenantRoles([]);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '角色分配失败');
    }
  }, [tenantRoles, userId, assignRolesMutation, onSuccess]);

  const handleClose = useCallback(() => {
    setTenantRoles([]);
    setSelectedTenant('');
    setSelectedRole('');
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>分配角色</DialogTitle>
          <DialogDescription>
            为用户分配在不同租户中的角色
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 添加角色分配 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="tenant">租户</Label>
              <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                <SelectTrigger>
                  <SelectValue placeholder="选择租户" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="role">角色</Label>
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
                disabled={!selectedTenant}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name} ({role.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleAddAssignment}
                disabled={!selectedTenant || !selectedRole}
                className="w-full"
                type="button"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加
              </Button>
            </div>
          </div>

          {/* 已分配的角色列表 */}
          <div className="space-y-2">
            <Label>待分配的角色</Label>
            {tenantRoles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
                暂无角色分配
              </div>
            ) : (
              tenantRoles.map((assignment, index) => (
                <div
                  key={`${assignment.tenant_id}-${assignment.role_id}`}
                  className="flex items-center justify-between p-3 border rounded-md bg-muted/30"
                >
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {getTenantName(assignment.tenant_id)}
                    </Badge>
                    <span className="text-muted-foreground">→</span>
                    <Badge variant="secondary">
                      {getRoleName(assignment.role_id)}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAssignment(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleClose}
              type="button"
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={assignRolesMutation.isPending || tenantRoles.length === 0}
              type="button"
            >
              {assignRolesMutation.isPending ? '分配中...' : '确认分配'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});