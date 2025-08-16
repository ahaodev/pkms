// 用户租户角色管理页面

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Users, Building2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useUsers } from '@/hooks/use-users';
import { useTenants } from '@/hooks/use-tenants';
import { useRoles } from '@/hooks/use-roles';
import {
  useAllUserTenantRoles,
  useAssignUserTenantRoles,
  useRemoveUserTenantRole,
} from '@/hooks/use-user-tenant-role';
import type {
  AssignUserTenantRoleRequest,
  RemoveUserTenantRoleRequest,
  TenantRoleAssignment,
} from '@/types/user-tenant-role';

const UserTenantRoleManagement: React.FC = () => {
  const { data: users = [] } = useUsers();
  const { data: tenants = [] } = useTenants();
  const { data: roles = [] } = useRoles();
  
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  
  const { data: userTenantRoles = [], refetch } = useAllUserTenantRoles(selectedUserId);
  const removeRoleMutation = useRemoveUserTenantRole();

  // 获取用户名称
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || userId;
  };

  // 获取租户名称
  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant?.name || tenantId;
  };

  // 获取角色名称
  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || roleId;
  };

  // 获取角色代码
  const getRoleCode = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.code || roleId;
  };

  // 移除用户租户角色
  const handleRemoveRole = async (userTenantRole: any) => {
    const request: RemoveUserTenantRoleRequest = {
      user_id: userTenantRole.user_id,
      tenant_id: userTenantRole.tenant_id,
      role_id: userTenantRole.role_id,
    };

    try {
      await removeRoleMutation.mutateAsync(request);
      toast.success('角色移除成功');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '角色移除失败');
    }
  };

  // 按租户分组用户角色
  const groupedRoles = userTenantRoles.reduce((acc, role) => {
    const tenantId = role.tenant_id;
    if (!acc[tenantId]) {
      acc[tenantId] = [];
    }
    acc[tenantId].push(role);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">用户租户角色管理</h1>
          <p className="text-gray-600">管理用户在不同租户中的角色分配</p>
        </div>
        
        <Button
          onClick={() => setIsAssignDialogOpen(true)}
          disabled={!selectedUserId}
        >
          <Plus className="h-4 w-4 mr-2" />
          分配角色
        </Button>
      </div>

      {/* 用户选择 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            选择用户
          </CardTitle>
          <CardDescription>
            选择要管理角色的用户
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Label htmlFor="user-select">用户</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择用户" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedUserId && (
              <div className="text-sm text-muted-foreground">
                已选择: <strong>{getUserName(selectedUserId)}</strong>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 用户角色列表 */}
      {selectedUserId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {getUserName(selectedUserId)} 的角色分配
            </CardTitle>
            <CardDescription>
              用户在各个租户中的角色分配情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(groupedRoles).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                该用户暂无角色分配
              </div>
            ) : (
              Object.entries(groupedRoles).map(([tenantId, roles]) => (
                <div key={tenantId} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4" />
                    <Badge variant="outline" className="text-sm">
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
                      {roles.map((role, index) => (
                        <TableRow key={`${role.tenant_id}-${role.role_id}-${index}`}>
                          <TableCell className="font-medium">
                            {getRoleName(role.role_id)}
                          </TableCell>
                          <TableCell>
                            <code className="px-2 py-1 bg-gray-100 rounded text-sm">
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
                              disabled={removeRoleMutation.isPending}
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
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* 分配角色对话框 */}
      <AssignRoleDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        userId={selectedUserId}
        onSuccess={() => {
          refetch();
          setIsAssignDialogOpen(false);
        }}
      />
    </div>
  );
};

// 分配角色对话框组件
interface AssignRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess: () => void;
}

const AssignRoleDialog: React.FC<AssignRoleDialogProps> = ({
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

  const handleAddAssignment = () => {
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

    setTenantRoles([...tenantRoles, newAssignment]);
    setSelectedTenant('');
    setSelectedRole('');
  };

  const handleRemoveAssignment = (index: number) => {
    const newAssignments = tenantRoles.filter((_, i) => i !== index);
    setTenantRoles(newAssignments);
  };

  const handleSubmit = async () => {
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
  };

  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant?.name || tenantId;
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || roleId;
  };

  // 获取指定租户的可用角色
  const getAvailableRolesForTenant = (tenantId: string) => {
    return roles.filter((role) => role.tenant_id === tenantId || !role.tenant_id);
  };

  const availableRoles = selectedTenant ? getAvailableRolesForTenant(selectedTenant) : [];

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
              <div className="text-sm text-muted-foreground p-3 border border-dashed rounded-md text-center">
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={assignRolesMutation.isPending || tenantRoles.length === 0}
            >
              {assignRolesMutation.isPending ? '分配中...' : '确认分配'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserTenantRoleManagement;