import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TenantRoleAssignment } from '@/types/user-tenant-role';
import { useTenants } from '@/hooks/use-tenants';
import { useRoles } from '@/hooks/use-roles';
import { useI18n } from '@/contexts/i18n-context';

interface TenantRoleAssignmentProps {
  assignments: TenantRoleAssignment[];
  onChange: (assignments: TenantRoleAssignment[]) => void;
  disabled?: boolean;
}

export function TenantRoleAssignmentComponent({
  assignments,
  onChange,
  disabled = false,
}: TenantRoleAssignmentProps) {
  const { t } = useI18n();
  const { data: tenants = [] } = useTenants();
  const { data: roles = [] } = useRoles();
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const handleAddAssignment = () => {
    if (!selectedTenant || !selectedRole) return;

    // 检查是否已存在相同的分配
    const exists = assignments.some(
      (assignment) =>
        assignment.tenant_id === selectedTenant && assignment.role_id === selectedRole
    );

    if (exists) return;

    const newAssignment: TenantRoleAssignment = {
      tenant_id: selectedTenant,
      role_id: selectedRole,
    };

    onChange([...assignments, newAssignment]);
    setSelectedTenant('');
    setSelectedRole('');
  };

  const handleRemoveAssignment = (index: number) => {
    const newAssignments = assignments.filter((_, i) => i !== index);
    onChange(newAssignments);
  };

  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    return tenant?.name || tenantId;
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    return role?.name || roleId;
  };

  // 获取指定租户的可用角色
  const getAvailableRolesForTenant = (tenantId: string) => {
    return roles.filter((role) => role.tenant_id === tenantId || !role.tenant_id);
  };

  const availableRoles = selectedTenant ? getAvailableRolesForTenant(selectedTenant) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{t('user.tenantRoleAssignment')}</CardTitle>
        <CardDescription className="text-xs">
          {t('user.tenantRoleAssignmentDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 添加新分配 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="tenant" className="text-xs">{t('tenant.name')}</Label>
            <Select
              value={selectedTenant}
              onValueChange={setSelectedTenant}
              disabled={disabled}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder={t('user.selectTenant')} />
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
            <Label htmlFor="role" className="text-xs">{t('role.name')}</Label>
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
              disabled={disabled || !selectedTenant}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder={t('user.selectRole')} />
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
              type="button"
              size="sm"
              onClick={handleAddAssignment}
              disabled={disabled || !selectedTenant || !selectedRole}
              className="h-8"
            >
              <Plus className="w-3 h-3 mr-1" />
              {t('common.add')}
            </Button>
          </div>
        </div>

        {/* 已分配的角色列表 */}
        <div className="space-y-2">
          {assignments.length === 0 ? (
            <div className="text-xs text-muted-foreground p-3 border border-dashed rounded-md text-center">
              {t('user.noTenantRoleAssignments')}
            </div>
          ) : (
            assignments.map((assignment, index) => (
              <div
                key={`${assignment.tenant_id}-${assignment.role_id}`}
                className="flex items-center justify-between p-2 border rounded-md bg-muted/30"
              >
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {getTenantName(assignment.tenant_id)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">→</span>
                  <Badge variant="secondary" className="text-xs">
                    {getRoleName(assignment.role_id)}
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAssignment(index)}
                  disabled={disabled}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}